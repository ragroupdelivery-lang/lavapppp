import { Order, Customer, Service, OrderStatus, ServiceCategory, OrderItem, User } from '../types';

// --- MOCK DATABASE ---

let mockCustomers: Customer[] = [
  { id: 'cust1', name: 'John Doe', email: 'john.doe@example.com', phone: '555-1234', joinedDate: '2023-01-15', address: '123 Main St, Anytown, USA' },
  { id: 'cust2', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '555-5678', joinedDate: '2023-02-20', address: '456 Oak Ave, Anytown, USA' },
  { id: 'cust3', name: 'Peter Jones', email: 'peter.jones@example.com', phone: '555-8765', joinedDate: '2023-03-10', address: '789 Pine Ln, Anytown, USA' },
  { id: 'cust4', name: 'Mary Johnson', email: 'mary.j@example.com', phone: '555-4321', joinedDate: '2023-05-01', address: '321 Elm St, Anytown, USA' },
];

let mockServices: Service[] = [
  { id: 'plan-solo', name: 'Plano SOLO', description: 'Ideal for singles.', price: 169.90, category: ServiceCategory.Plan, availability: 'plan' },
  { id: 'plan-duo', name: 'Plano DUO', description: 'Perfect for couples.', price: 259.90, category: ServiceCategory.Plan, availability: 'plan' },
  { id: 'plan-infinity', name: 'Plano INFINITY', description: 'For large families.', price: 329.90, category: ServiceCategory.Plan, availability: 'plan' },
  { id: 'extra-ciclo-plano', name: 'Ciclo Extra (Plano)', description: '50% discount for subscribers.', price: 7.50, category: ServiceCategory.Extra, availability: 'plan' },
  { id: 'extra-hipo-plano', name: 'Hipoalergênico (Plano)', description: 'For sensitive skin.', price: 10.00, category: ServiceCategory.Extra, availability: 'plan' },
  { id: 'extra-tiramanchas-plano', name: 'Tira-Manchas (Plano)', description: 'Vanish Oxi Action.', price: 14.90, category: ServiceCategory.Extra, availability: 'plan' },
  { id: 'serv-cesto', name: 'Cesto Base', description: 'Up to 8kg, wash, dry, fold.', price: 44.90, category: ServiceCategory.Base, availability: 'avulso' },
  { id: 'extra-ciclo-avulso', name: 'Ciclo Adicional', description: 'Complete separate wash.', price: 15.00, category: ServiceCategory.Extra, availability: 'avulso' },
  { id: 'extra-tiramanchas-avulso', name: 'Tira-Manchas', description: 'Vanish Oxi Action.', price: 14.90, category: ServiceCategory.Extra, availability: 'avulso' },
  { id: 'extra-hipo-avulso', name: 'Hipoalergênico', description: 'For sensitive skin.', price: 15.00, category: ServiceCategory.Extra, availability: 'avulso' },
  { id: 'extra-passa-5', name: 'Passadoria 5 Peças', description: 'Ready-to-wear clothes.', price: 19.90, category: ServiceCategory.Extra, availability: 'avulso' },
  { id: 'extra-passa-10', name: 'Passadoria 10 Peças', description: 'With discount.', price: 34.90, category: ServiceCategory.Extra, availability: 'avulso' },
  { id: 'extra-passa-20', name: 'Passadoria 20 Peças', description: 'Economic package.', price: 58.90, category: ServiceCategory.Extra, availability: 'avulso' },
  { id: 'serv-edredom-casal', name: 'Edredom Casal/Queen', description: 'Deep and careful cleaning.', price: 44.90, category: ServiceCategory.SpecialCare, availability: 'avulso' },
  { id: 'serv-edredom-king', name: 'Edredom King', description: 'Premium treatment for large items.', price: 79.90, category: ServiceCategory.SpecialCare, availability: 'avulso' },
  { id: 'serv-jogocama', name: 'Jogo de Cama', description: 'Complete wash with Omo + Comfort.', price: 39.90, category: ServiceCategory.SpecialCare, availability: 'avulso' },
  { id: 'serv-toalhas', name: 'Kit Toalhas', description: '2 body + 4 face towels.', price: 39.90, category: ServiceCategory.SpecialCare, availability: 'avulso' },
  { id: 'serv-saco', name: 'Saco Organizador', description: 'Basic protection and organization.', price: 15.00, category: ServiceCategory.Packaging, availability: 'both' },
  { id: 'serv-vacuo', name: 'Embalagem à Vácuo', description: 'Up to 70% space saving.', price: 25.00, category: ServiceCategory.Packaging, availability: 'both' },
];

let mockOrders: Order[] = [
  { id: 'ord001', customerId: 'cust1', customerName: 'John Doe', date: '2024-07-28', total: 44.90, status: OrderStatus.Completed, items: [{ serviceId: 'serv-cesto', name: 'Cesto Base', quantity: 1, price: 44.90 }], collectionAddress: '123 Main St, Anytown, USA', deliveryAddress: '123 Main St', collectionTime: 'AM Slot', deliveryTime: 'PM Slot' },
  { id: 'ord002', customerId: 'cust2', customerName: 'Jane Smith', date: '2024-07-29', total: 169.90, status: OrderStatus.Completed, items: [{ serviceId: 'plan-solo', name: 'Plano SOLO', quantity: 1, price: 169.90 }], collectionAddress: '456 Oak Ave, Anytown, USA', deliveryAddress: '456 Oak Ave', collectionTime: 'PM Slot', deliveryTime: 'AM Slot' },
  { id: 'ord003', customerId: 'cust3', customerName: 'Peter Jones', date: '2024-07-30', total: 79.90, status: OrderStatus.ReadyForDelivery, items: [{ serviceId: 'serv-edredom-king', name: 'Edredom King', quantity: 1, price: 79.90 }], collectionAddress: '789 Pine Ln, Anytown, USA', deliveryAddress: '789 Pine Ln', collectionTime: 'AM Slot', deliveryTime: 'PM Slot' },
  { id: 'ord004', customerId: 'cust1', customerName: 'John Doe', date: '2024-07-31', total: 60.90, status: OrderStatus.InProgress, items: [{ serviceId: 'serv-cesto', name: 'Cesto Base', quantity: 1, price: 44.90 }, { serviceId: 'extra-ciclo-avulso', name: 'Ciclo Adicional', quantity: 1, price: 15.00 }], collectionAddress: '123 Main St, Anytown, USA', deliveryAddress: '123 Main St', collectionTime: 'AM Slot', deliveryTime: 'PM Slot' },
  { id: 'ord005', customerId: 'cust4', customerName: 'Mary Johnson', date: '2024-08-01', total: 329.90, status: OrderStatus.PendingCollection, items: [{ serviceId: 'plan-infinity', name: 'Plano INFINITY', quantity: 1, price: 329.90 }], collectionAddress: '321 Elm St, Anytown, USA', deliveryAddress: '321 Elm St', collectionTime: 'PM Slot', deliveryTime: 'AM Slot' },
];

let mockUsers: User[] = [
  { id: 'user1', name: 'Admin', email: 'admin@lavapp.com', role: 'admin' },
  { id: 'user2', name: 'John Doe', email: 'john.doe@example.com', role: 'customer', phone: '555-1234', address: '123 Main St, Anytown, USA' },
  { id: 'user3', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'customer', phone: '555-5678', address: '456 Oak Ave, Anytown, USA' },
];

const simulateDelay = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 300));
}

// --- API FUNCTIONS ---

// Dashboard
export const getDashboardData = async () => { /* ... (same as before) ... */ 
    const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);
    const weeklySales = [
        { name: 'Mon', sales: 400 }, { name: 'Tue', sales: 300 }, { name: 'Wed', sales: 500 },
        { name: 'Thu', sales: 280 }, { name: 'Fri', sales: 450 }, { name: 'Sat', sales: 600 },
        { name: 'Sun', sales: 350 },
    ];
    const recentOrders = [...mockOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return simulateDelay({
        stats: {
            totalRevenue,
            totalOrders: mockOrders.length,
            newCustomers: mockCustomers.length,
            pendingOrders: mockOrders.filter(o => o.status === OrderStatus.PendingCollection).length
        },
        weeklySales,
        recentOrders
    });
}

// Orders
export const getOrders = async () => simulateDelay([...mockOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
export const getOrderById = async (id: string) => simulateDelay(mockOrders.find(o => o.id === id));
export const getOrdersByCustomerId = async (customerId: string) => simulateDelay(mockOrders.filter(o => o.customerId === customerId));
export const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const orderIndex = mockOrders.findIndex(order => order.id === id);
    if (orderIndex !== -1) {
        mockOrders[orderIndex].status = status;
        return simulateDelay(mockOrders[orderIndex]);
    }
    return simulateDelay(null);
};
export const createOrder = async (orderData: { customerId: string, customerName: string; address: string; phone: string; items: OrderItem[]; total: number; collectionTime: string; }): Promise<Order> => {
    const newOrderId = `ord${(mockOrders.length + 1).toString().padStart(3, '0')}`;
    const newOrder: Order = {
        id: newOrderId,
        customerId: orderData.customerId,
        customerName: orderData.customerName,
        date: new Date().toISOString().split('T')[0],
        total: orderData.total,
        status: OrderStatus.PendingCollection,
        items: orderData.items,
        collectionAddress: orderData.address,
        deliveryAddress: orderData.address,
        collectionTime: orderData.collectionTime,
        deliveryTime: 'TBD',
    };
    mockOrders.unshift(newOrder);
    return simulateDelay(newOrder);
}

// Customers
export const getCustomers = async () => simulateDelay(mockCustomers);
export const getCustomerById = async (id: string) => simulateDelay(mockCustomers.find(c => c.id === id));


// Services
export const getServices = async () => simulateDelay(mockServices);
export const createService = async (service: Omit<Service, 'id'>) => {
    const newService: Service = { ...service, id: `serv-${Math.random().toString(36).substr(2, 9)}` };
    mockServices.push(newService);
    return simulateDelay(newService);
}
export const updateService = async (service: Service) => {
    const index = mockServices.findIndex(s => s.id === service.id);
    if (index > -1) {
        mockServices[index] = service;
        return simulateDelay(service);
    }
    return null;
}
export const deleteService = async (id: string) => {
    mockServices = mockServices.filter(s => s.id !== id);
    return simulateDelay({ success: true });
}

// Auth
export const login = async (email: string, pass: string): Promise<User | null> => {
    console.log(`Attempting login for: ${email}`);
    // In a real app, 'pass' would be hashed and checked
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && pass === 'password123') { // Using a dummy password for all users
        sessionStorage.setItem('loggedInUser', JSON.stringify(user));
        return simulateDelay(user);
    }
    return simulateDelay(null);
}

export const signup = async(data: {name: string, email: string, phone: string, address: string, pass: string}): Promise<User | null> => {
    const existing = mockUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
        return null; // User already exists
    }
    const newUser: User = {
        id: `user${mockUsers.length + 1}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        role: 'customer'
    };
    mockUsers.push(newUser);
    const newCustomer: Customer = {
        id: `cust${mockCustomers.length + 1}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        joinedDate: new Date().toISOString().split('T')[0]
    };
    mockCustomers.push(newCustomer);
    sessionStorage.setItem('loggedInUser', JSON.stringify(newUser));
    return simulateDelay(newUser);
}

export const logout = async () => {
    sessionStorage.removeItem('loggedInUser');
    return simulateDelay(null);
}

export const getLoggedInUser = async (): Promise<User | null> => {
    const userJson = sessionStorage.getItem('loggedInUser');
    if (userJson) {
        return simulateDelay(JSON.parse(userJson));
    }
    return simulateDelay(null);
}
