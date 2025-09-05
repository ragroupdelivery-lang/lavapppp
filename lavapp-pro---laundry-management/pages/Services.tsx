
import React, { useState, useEffect } from 'react';
import { getServices } from '../services/api';
import { Service, ServiceCategory } from '../types';
import Card from '../components/ui/Card';

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => (
    <div className="bg-brand-gray-50 p-4 rounded-lg border border-brand-gray-200 flex justify-between items-center">
        <div>
            <p className="font-semibold text-brand-gray-800">{service.name}</p>
            <p className="text-sm text-brand-gray-500">{service.description}</p>
        </div>
        <div className="text-right">
            <p className="font-bold text-lg text-brand-blue-dark">${service.price.toFixed(2)}</p>
            <button className="text-sm text-brand-blue hover:underline mt-1">Edit</button>
        </div>
    </div>
);

const Services: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await getServices();
                setServices(data);
            } catch (error) {
                console.error("Failed to fetch services:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const renderServicesByCategory = (category: ServiceCategory) => (
        services
            .filter(service => service.category === category)
            .map(service => <ServiceCard key={service.id} service={service} />)
    );

    if (loading) {
        return <div className="text-center p-8">Loading services...</div>;
    }

    return (
        <div className="space-y-6">
            <Card title="Monthly Plans">
                <div className="space-y-4">
                    {renderServicesByCategory(ServiceCategory.MonthlyPlan)}
                </div>
            </Card>
            <Card title="Per Item Services">
                <div className="space-y-4">
                    {renderServicesByCategory(ServiceCategory.PerItem)}
                </div>
            </Card>
            <Card title="Add-ons">
                <div className="space-y-4">
                    {renderServicesByCategory(ServiceCategory.Addon)}
                </div>
            </Card>
        </div>
    );
};

export default Services;
