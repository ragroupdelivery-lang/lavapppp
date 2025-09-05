import React, { useState, useEffect, useMemo } from 'react';
import { createOrder } from '../services/api';
import { OrderItem } from '../types';

interface CartItem {
  type: 'plan' | 'extra' | 'service';
  name: string;
  price: number;
  quantity: number;
  serviceId: string;
}

const ClientPortal: React.FC = () => {
    const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedServiceType, setSelectedServiceType] = useState<'planos' | 'avulsos' | ''>('');
    const [formState, setFormState] = useState({
        customerName: '',
        customerPhone: '',
        customerCep: '',
        customerStreet: '',
        customerNumber: '',
        customerComplement: '',
        customerNeighborhood: '',
        customerCity: '',
        pickupDate: '',
        pickupShift: '',
        customerNotes: ''
    });
    const [cepLoading, setCepLoading] = useState(false);
    const [cepError, setCepError] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    const totalPrice = useMemo(() => {
        return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [selectedItems]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);
    
    useEffect(() => {
        const dateInput = document.getElementById('pickupDate') as HTMLInputElement;
        if (dateInput) {
            const today = new Date();
            dateInput.min = today.toISOString().split('T')[0];
            const maxDate = new Date(today);
            maxDate.setDate(maxDate.getDate() + 30);
            dateInput.max = maxDate.toISOString().split('T')[0];
        }
    }, [currentStep]);

    const updateProgressBar = (step: number) => {
        for (let i = 1; i <= 4; i++) {
            const circle = document.getElementById(`step${i}-circle`);
            const title = document.getElementById(`step${i}-title`);
            if (!circle || !title) continue;
            const isActive = i <= step;
            circle.className = `w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isActive ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-500'}`;
            title.className = `text-sm font-semibold ${isActive ? 'text-purple-600' : 'text-gray-500'}`;
        }
    };

    const goToStep = (step: number) => {
        if ((step === 3 || step === 4) && selectedItems.length === 0) {
            alert('❌ Por favor, selecione pelo menos um item antes de continuar.');
            return;
        }
        setCurrentStep(step);
        updateProgressBar(step);
    };

    const handleSelectServiceType = (type: 'planos' | 'avulsos') => {
        setSelectedServiceType(type);
        goToStep(2);
    }
    
    const handleSwitchType = (type: 'planos' | 'avulsos') => {
        if (selectedItems.length > 0) {
            if (!confirm('⚠️ Ao trocar, seu pedido atual será limpo. Deseja continuar?')) return;
        }
        setSelectedItems([]);
        setSelectedServiceType(type);
        goToStep(2);
    }

    const updateItemQuantity = (item: CartItem, newQuantity: number) => {
        if (newQuantity <= 0) {
            setSelectedItems(prev => prev.filter(i => i.name !== item.name));
        } else {
            setSelectedItems(prev => prev.map(i => i.name === item.name ? { ...i, quantity: newQuantity } : i));
        }
    };

    const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
        const existingItem = selectedItems.find(item => item.name === newItem.name);
        if (existingItem) {
            updateItemQuantity(existingItem, existingItem.quantity + 1);
        } else {
            if (newItem.type === 'plan') {
                 setSelectedItems(prev => [...prev.filter(i => i.type !== 'plan'), { ...newItem, quantity: 1 }]);
            } else {
                 setSelectedItems(prev => [...prev, { ...newItem, quantity: 1 }]);
            }
        }
    };
    
    const getItemQuantity = (name: string) => selectedItems.find(item => item.name === name)?.quantity || 0;
    
    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let cep = e.target.value.replace(/\D/g, '');
        if (cep.length > 5) cep = cep.replace(/^(\d{5})(\d)/, '$1-$2');
        setFormState(prev => ({ ...prev, customerCep: cep }));
        
        if (cep.length === 9) {
            setCepLoading(true);
            setCepError(false);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep.replace('-', '')}/json/`);
                if (!response.ok) throw new Error('CEP Inválido');
                const data = await response.json();
                if (data.erro) throw new Error('CEP não encontrado');
                setFormState(prev => ({
                    ...prev,
                    customerStreet: data.logradouro || '',
                    customerNeighborhood: data.bairro || '',
                    customerCity: data.localidade || ''
                }));
            } catch (err) {
                setCepError(true);
                setFormState(prev => ({ ...prev, customerStreet: '', customerNeighborhood: '', customerCity: '' }));
            } finally {
                setCepLoading(false);
            }
        }
    };
    
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let phone = e.target.value.replace(/\D/g, '').substring(0, 11);
        if (phone.length > 10) phone = phone.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        else if (phone.length > 6) phone = phone.replace(/^(\d{2})(\d{4})(\d)/, '($1) $2-$3');
        else if (phone.length > 2) phone = phone.replace(/^(\d{2})(\d)/, '($1) $2');
        setFormState(prev => ({ ...prev, customerPhone: phone }));
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState(prev => ({...prev, [e.target.id]: e.target.value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const requiredFields = [
            'customerName', 'customerPhone', 'customerCep', 'customerStreet', 
            'customerNumber', 'customerNeighborhood', 'customerCity', 'pickupDate', 'pickupShift'
        ];

        for (const field of requiredFields) {
            if (!formState[field as keyof typeof formState]) {
                alert(`❌ Por favor, preencha o campo: ${field}`);
                return;
            }
        }
        
        const orderItems: OrderItem[] = selectedItems.map(item => ({
            serviceId: item.serviceId,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        }));

        const address = `${formState.customerStreet}, ${formState.customerNumber}${formState.customerComplement ? `, ${formState.customerComplement}` : ''} - ${formState.customerNeighborhood}, ${formState.customerCity} - CEP: ${formState.customerCep}`;
        
        const pickupDate = new Date(formState.pickupDate + 'T00:00:00').toLocaleDateString('pt-BR');
        const shiftNames: { [key: string]: string } = { 'manha': '🌅 Manhã (8h-12h)', 'tarde': '☀️ Tarde (13h-17h)', 'noite': '🌙 Noite (18h-22h)' };
        const pickupShift = shiftNames[formState.pickupShift];

        try {
            await createOrder({
                customerName: formState.customerName,
                address: address,
                phone: formState.customerPhone,
                items: orderItems,
                total: totalPrice,
                collectionTime: `${pickupDate} - ${pickupShift}`
            });
            setOrderPlaced(true);
            goToStep(4);
        } catch (error) {
            alert("Houve um erro ao criar seu pedido. Tente novamente.");
            console.error(error);
        }
    };
    
    const QuantityControl: React.FC<{itemName: string}> = ({itemName}) => {
        const item = selectedItems.find(i => i.name === itemName);
        return (
             <div className="flex items-center justify-center space-x-2">
                <button onClick={() => updateItemQuantity(item!, (item?.quantity || 0) - 1)} className="bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 flex items-center justify-center">-</button>
                <span className="font-bold text-lg min-w-[2rem] text-center">{item?.quantity || 0}</span>
                <button onClick={() => addItem(item!)} className="bg-purple-600 text-white w-8 h-8 rounded-full hover:bg-purple-700 flex items-center justify-center">+</button>
            </div>
        )
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-center p-4">
                 <div className="bg-white p-10 rounded-2xl shadow-lg">
                    <div className="text-8xl mb-4">✅</div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Pedido Enviado com Sucesso!</h1>
                    <p className="text-xl text-gray-600 mb-8">Obrigado, {formState.customerName}! Recebemos seu pedido e entraremos em contato em breve.</p>
                    <button onClick={() => { setOrderPlaced(false); setSelectedItems([]); goToStep(1); }} className="bg-purple-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors">Fazer Novo Pedido</button>
                 </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50">
            <header className="gradient-bg text-white py-12">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-4">🧺 Lavapp</h1>
                    <p className="text-xl mb-2">Lavanderia Delivery Premium</p>
                    <p className="text-lg opacity-90">Mais tempo para você, menos preocupação com roupas</p>
                </div>
            </header>

            <nav className="bg-white shadow-lg sticky top-0 z-40" aria-label="Progresso do Pedido">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex justify-center items-center space-x-4 max-w-4xl mx-auto">
                        <div className="flex items-center">
                            <div id="step1-circle" className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                            <div className="ml-3 hidden md:block"><div id="step1-title" className="text-sm font-semibold text-purple-600">Apresentação</div><div className="text-xs text-gray-500">Conheça nossos serviços</div></div>
                        </div>
                        <div className="w-8 h-0.5 bg-gray-300"></div>
                        <div className="flex items-center">
                            <div id="step2-circle" className="w-10 h-10 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center font-bold text-sm">2</div>
                            <div className="ml-3 hidden md:block"><div id="step2-title" className="text-sm font-semibold text-gray-500">Montar Pedido</div><div className="text-xs text-gray-500">Escolha seus serviços</div></div>
                        </div>
                        <div className="w-8 h-0.5 bg-gray-300"></div>
                        <div className="flex items-center">
                            <div id="step3-circle" className="w-10 h-10 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center font-bold text-sm">3</div>
                            <div className="ml-3 hidden md:block"><div id="step3-title" className="text-sm font-semibold text-gray-500">Confirmação</div><div className="text-xs text-gray-500">Revise seu pedido</div></div>
                        </div>
                        <div className="w-8 h-0.5 bg-gray-300"></div>
                        <div className="flex items-center">
                            <div id="step4-circle" className="w-10 h-10 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center font-bold text-sm">4</div>
                            <div className="ml-3 hidden md:block"><div id="step4-title" className="text-sm font-semibold text-gray-500">Enviar</div><div className="text-xs text-gray-500">Finalizar pedido</div></div>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                {currentStep === 1 && (
                    <section id="step1" className="py-16">
                        <div className="container mx-auto px-4">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-bold text-gray-800 mb-4">🧺 Bem-vindo à Lavapp!</h2>
                                <p className="text-xl text-gray-600 mb-8">Escolha como deseja usar nossos serviços</p>
                                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                    <article className="bg-white rounded-xl shadow-lg p-8 card-hover">
                                        <div className="text-6xl mb-4">📋</div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Planos Mensais</h3>
                                        <p className="text-gray-600 mb-6">Assinatura com desconto e comodidade para uso regular</p>
                                        <button onClick={() => handleSelectServiceType('planos')} className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors">Ver Planos Mensais</button>
                                    </article>
                                    <article className="bg-white rounded-xl shadow-lg p-8 card-hover">
                                        <div className="text-6xl mb-4">🧼</div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Serviços Avulsos</h3>
                                        <p className="text-gray-600 mb-6">Pagamento por uso, ideal para necessidades pontuais</p>
                                        <button onClick={() => handleSelectServiceType('avulsos')} className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">Ver Serviços Avulsos</button>
                                    </article>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
                
                {currentStep === 2 && selectedServiceType === 'planos' && (
                    <section id="step2-planos" className="py-16">
                        <div className="container mx-auto px-4">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-bold text-gray-800 mb-4">📋 Planos Mensais</h2>
                                <p className="text-xl text-gray-600">Escolha o plano ideal para sua rotina</p>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
                               <article className="bg-white rounded-xl shadow-lg p-8 card-hover">
                                    <h3 className="text-2xl font-bold text-center text-gray-800">Plano SOLO</h3>
                                    <div className="text-center my-6"><div className="text-4xl font-bold text-purple-600 mb-2">R$ 169,90</div></div>
                                    <button onClick={() => addItem({serviceId: 'plan-solo', type: 'plan', name: 'Plano SOLO', price: 169.90})} className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors">Escolher SOLO</button>
                                </article>
                                <article className="bg-white rounded-xl shadow-lg p-8 card-hover">
                                    <h3 className="text-2xl font-bold text-center text-gray-800">Plano DUO</h3>
                                    <div className="text-center my-6"><div className="text-4xl font-bold text-purple-600 mb-2">R$ 259,90</div></div>
                                    <button onClick={() => addItem({serviceId: 'plan-duo', type: 'plan', name: 'Plano DUO', price: 259.90})} className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors">Escolher DUO</button>
                                </article>
                                <article className="bg-white rounded-xl shadow-lg p-8 card-hover">
                                    <h3 className="text-2xl font-bold text-center text-gray-800">Plano INFINITY</h3>
                                    <div className="text-center my-6"><div className="text-4xl font-bold text-purple-600 mb-2">R$ 329,90</div></div>
                                    <button onClick={() => addItem({serviceId: 'plan-infinity', type: 'plan', name: 'Plano INFINITY', price: 329.90})} className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors">Escolher INFINITY</button>
                                </article>
                            </div>

                            <div className="text-center mt-12 space-y-4">
                                <button onClick={() => goToStep(3)} className="bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors">Continuar para Confirmação →</button>
                                <div><button onClick={() => handleSwitchType('avulsos')} className="text-blue-600 hover:text-blue-800 underline font-medium">🔄 Prefiro Serviços Avulsos</button></div>
                            </div>
                        </div>
                    </section>
                )}

                {currentStep === 2 && selectedServiceType === 'avulsos' && (
                     <section id="step2-avulsos" className="py-16">
                         <div className="container mx-auto px-4">
                             <div className="text-center mb-12"><h2 className="text-4xl font-bold text-gray-800 mb-4">🧼 Serviços Avulsos</h2><p className="text-xl text-gray-600">Serviços pontuais quando você precisar</p></div>
                             <div className="mb-16"><h3 className="text-2xl font-bold text-center mb-8 text-gray-800">Serviço Base</h3><div className="flex justify-center"><article className="bg-white rounded-xl shadow-lg p-8 card-hover max-w-sm"><h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Cesto Base</h3><div className="text-center mb-6"><div className="text-4xl font-bold text-blue-600">R$ 44,90</div></div>
                             <div className="flex items-center justify-center space-x-3">
                                <button onClick={() => updateItemQuantity({name: 'Cesto Base'} as CartItem, getItemQuantity('Cesto Base')-1)} className="bg-red-500 text-white w-10 h-10 rounded-full hover:bg-red-600 flex items-center justify-center text-lg">-</button>
                                <span className="font-bold text-xl min-w-[3rem] text-center">{getItemQuantity('Cesto Base')}</span>
                                <button onClick={() => addItem({serviceId: 'serv-cesto', type: 'service', name: 'Cesto Base', price: 44.90})} className="bg-blue-600 text-white w-10 h-10 rounded-full hover:bg-blue-700 flex items-center justify-center text-lg">+</button>
                             </div></article></div></div>
                             <div className="text-center mt-12 space-y-4">
                                <button onClick={() => goToStep(3)} className="bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors">Continuar para Confirmação →</button>
                                <div><button onClick={() => handleSwitchType('planos')} className="text-purple-600 hover:text-purple-800 underline font-medium">🔄 Prefiro Planos Mensais</button></div>
                             </div>
                         </div>
                     </section>
                )}

                {currentStep === 3 && (
                    <section id="step3" className="py-16">
                        <div className="container mx-auto px-4 max-w-2xl">
                            <div className="text-center mb-8"><h2 className="text-4xl font-bold text-gray-800 mb-4">✅ Confirmação do Pedido</h2><p className="text-xl text-gray-600">Revise os itens selecionados antes de prosseguir</p></div>
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold mb-6 text-gray-800">📋 Resumo do Pedido</h3>
                                    <div className="space-y-3 mb-6">
                                        {selectedItems.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">Nenhum item selecionado ainda</p>
                                        ) : (
                                            selectedItems.map(item => (
                                                <div key={item.name} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <span className="font-semibold">{item.name}</span>
                                                        {item.quantity > 1 && <span className="text-gray-500 ml-2">x{item.quantity}</span>}
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <span className="font-bold text-lg">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                                                        <button onClick={() => setSelectedItems(prev => prev.filter(i => i.name !== item.name))} className="text-red-500 hover:text-red-700 text-lg" aria-label={`Remover item ${item.name}`}>🗑️</button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="border-t pt-6">
                                        <div className="flex justify-between items-center text-2xl font-bold text-purple-600"><span>Total:</span><span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span></div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => goToStep(2)} className="flex-1 bg-gray-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-600 transition-colors">← Voltar e Editar</button>
                                    <button onClick={() => goToStep(4)} className="flex-1 bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors">Confirmar Pedido →</button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {currentStep === 4 && (
                    <section id="step4" className="py-16">
                        <div className="container mx-auto px-4 max-w-2xl">
                            <div className="text-center mb-8"><h2 className="text-4xl font-bold text-gray-800 mb-4">📱 Finalizar Pedido</h2><p className="text-xl text-gray-600">Preencha seus dados para agendar a coleta</p></div>
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                    <fieldset className="bg-gray-50 p-6 rounded-lg">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div><label htmlFor="customerName" className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label><input type="text" id="customerName" value={formState.customerName} onChange={handleFormChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"/></div>
                                            <div><label htmlFor="customerPhone" className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp *</label><input type="tel" id="customerPhone" value={formState.customerPhone} onChange={handlePhoneChange} required placeholder="(11) 99999-9999" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"/></div>
                                        </div>
                                    </fieldset>
                                    <fieldset className="bg-gray-50 p-6 rounded-lg">
                                        <div className="grid gap-4">
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div>
                                                    <label htmlFor="customerCep" className="block text-sm font-semibold text-gray-700 mb-2">CEP *</label>
                                                    <input type="text" id="customerCep" value={formState.customerCep} onChange={handleCepChange} required placeholder="00000-000" maxLength={9} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"/>
                                                    {cepLoading && <div className="text-sm text-blue-600 mt-1">🔍 Buscando CEP...</div>}
                                                    {cepError && <div className="text-sm text-red-600 mt-1">❌ CEP não encontrado</div>}
                                                </div>
                                                <div className="md:col-span-2"><label htmlFor="customerStreet" className="block text-sm font-semibold text-gray-700 mb-2">Rua/Logradouro *</label><input type="text" id="customerStreet" value={formState.customerStreet} onChange={handleFormChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"/></div>
                                            </div>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div><label htmlFor="customerNumber" className="block text-sm font-semibold text-gray-700 mb-2">Número *</label><input type="text" id="customerNumber" value={formState.customerNumber} onChange={handleFormChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"/></div>
                                                <div className="md:col-span-2"><label htmlFor="customerComplement" className="block text-sm font-semibold text-gray-700 mb-2">Complemento</label><input type="text" id="customerComplement" value={formState.customerComplement} onChange={handleFormChange} placeholder="Apto, bloco, casa..." className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"/></div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div><label htmlFor="customerNeighborhood" className="block text-sm font-semibold text-gray-700 mb-2">Bairro *</label><input type="text" id="customerNeighborhood" value={formState.customerNeighborhood} onChange={handleFormChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"/></div>
                                                <div><label htmlFor="customerCity" className="block text-sm font-semibold text-gray-700 mb-2">Cidade *</label><input type="text" id="customerCity" value={formState.customerCity} onChange={handleFormChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"/></div>
                                            </div>
                                        </div>
                                    </fieldset>
                                     <fieldset className="bg-gray-50 p-6 rounded-lg">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div><label htmlFor="pickupDate" className="block text-sm font-semibold text-gray-700 mb-2">Data da Coleta *</label><input type="date" id="pickupDate" value={formState.pickupDate} onChange={handleFormChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"/></div>
                                            <div><label htmlFor="pickupShift" className="block text-sm font-semibold text-gray-700 mb-2">Turno *</label><select id="pickupShift" value={formState.pickupShift} onChange={handleFormChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"><option value="">Selecione o turno</option><option value="manha">🌅 Manhã (8h às 12h)</option><option value="tarde">☀️ Tarde (13h às 17h)</option><option value="noite">🌙 Noite (18h às 22h)</option></select></div>
                                        </div>
                                    </fieldset>
                                    <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center">Finalizar e Enviar Pedido</button>
                                </form>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <footer className="bg-gray-800 text-white py-12">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-3xl font-bold mb-4">🧺 Lavapp</h3>
                    <p className="text-xl text-gray-300 mb-2">Lavanderia Delivery Premium</p>
                    <p className="text-gray-400">Mais tempo para você, menos preocupação com roupas</p>
                </div>
            </footer>
        </div>
    );
};

export default ClientPortal;
