
import React, { useState } from 'react';
import Card from '../components/ui/Card';

interface FormInputProps {
    label: string;
    id: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormInput: React.FC<FormInputProps> = ({ label, id, type = 'text', value, onChange }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-brand-gray-700">{label}</label>
        <div className="mt-1">
            <input
                type={type}
                name={id}
                id={id}
                className="shadow-sm focus:ring-brand-blue focus:border-brand-blue block w-full sm:text-sm border-brand-gray-300 rounded-md p-2"
                value={value}
                onChange={onChange}
            />
        </div>
    </div>
);

const Settings: React.FC = () => {
    const [formData, setFormData] = useState({
        laundryName: 'My Awesome Laundry',
        address: '123 Laundry Lane, Clean City, 12345',
        phone: '555-0101',
        email: 'contact@myawesomelaundry.com',
        openingTime: '09:00',
        closingTime: '18:00',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Settings saved!');
        console.log('Saved data:', formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card title="Business Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Laundry Name" id="laundryName" value={formData.laundryName} onChange={handleChange} />
                    <FormInput label="Contact Phone" id="phone" type="tel" value={formData.phone} onChange={handleChange} />
                    <FormInput label="Contact Email" id="email" type="email" value={formData.email} onChange={handleChange} />
                    <FormInput label="Address" id="address" value={formData.address} onChange={handleChange} />
                </div>
            </Card>

            <Card title="Operating Hours">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Opening Time" id="openingTime" type="time" value={formData.openingTime} onChange={handleChange} />
                    <FormInput label="Closing Time" id="closingTime" type="time" value={formData.closingTime} onChange={handleChange} />
                </div>
            </Card>

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                    Save Changes
                </button>
            </div>
        </form>
    );
};

export default Settings;
