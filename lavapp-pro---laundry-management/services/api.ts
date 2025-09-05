import { Order, Customer, Service, OrderStatus, ServiceCategory, OrderItem } from '../types';

// Mock Data
const mockCustomers: Customer[] = [
  { id: 'cust1', name: 'John Doe', email: 'john.doe@example.com', phone: '555-1234', joinedDate: '2023-01-15', address: '123 Main St, Anytown, USA' },
  { id: 'cust2', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '555-5678', joinedDate: '2023-02-20', address: '456 Oak Ave, Anytown, USA' },
  { id: 'cust3', name: 'Peter Jones', email: 'peter.jones@example.com', phone: '555-8765', joinedDate: '2023-03-10', address: '789 Pine Ln, Anytown, USA' },
  { id: 'cust4', name: 'Mary Johnson', email: 'mary.j@example.com', phone: '555-4321', joinedDate: '2023-05-01', address: '321 Elm St, Anytown, USA' },
];

const mockServices: Service[] = [
  { id: 'plan1', name: 'Starter Plan', description: '4 baskets per month.', price: 149.00, category: ServiceCategory.MonthlyPlan },
  { id: 'plan2', name: 'Pro Plan', description: '8 baskets per month, free add-ons.', price: 299.00, category: ServiceCategory.MonthlyPlan },
  { id: 'item1', name: 'T-shirt', description: 'Wash & Fold', price: 2.50, category: ServiceCategory.PerItem },
  { id: 'item2', name: 'Jeans', description: 'Wash & Fold', price: 4.00, category: ServiceCategory.PerItem },
  { id: 'item3', name: 'King Size Comforter', description: 'Special care', price: 35.00, category: ServiceCategory.PerItem },
  { id: 'addon1', name: 'Hypoallergenic Detergent', description: 'For sensitive skin', price: 5.00, category: ServiceCategory.Addon },
  { id: 'addon2', name: 'Stain Removal', description: 'Advanced stain treatment', price: 7.50, category: ServiceCategory.Addon },
];

let mockOrders: Order[] = [
  { id: 'ord001', customerId: 'cust1', customerName: 'John Doe', date: '2024-07-28', total: 42.50, status: OrderStatus.Completed, items: [{ serviceId: 'item1', name: 'T-shirt', quantity: 10, price: 2.50 }, { serviceId: 'item2', name: 'Jeans', quantity: 3, price: 4.00 }, { serviceId: 'addon2', name: 'Stain Removal', quantity: 1, price: 7.50 }], collectionAddress: '123 Main St', deliveryAddress: '123 Main St', collectionTime: 'AM Slot', deliveryTime: 'PM Slot' },
  { id: 'ord002', customerId: 'cust2', customerName: 'Jane Smith', date: '2024-07-29', total: 149.00, status: OrderStatus.Completed, items: [{ serviceId: 'plan1', name: 'Starter Plan', quantity: 1, price: 149.00 }], collectionAddress: '456 Oak Ave', deliveryAddress: '456 Oak Ave', collectionTime: 'PM Slot', deliveryTime: 'AM Slot' },
  { id: 'ord003', customerId: 'cust3', customerName: 'Peter Jones', date: '2024-07-30', total: 35.00, status: OrderStatus.ReadyForDelivery, items: [{ serviceId: 'item3', name: 'King Size Comforter', quantity: 1, price: 35.00 }], collectionAddress: '789 Pine Ln', deliveryAddress: '789 Pine Ln', collectionTime: 'AM Slot', deliveryTime: 'PM Slot' },
  { id: 'ord004', customerId: 'cust1', customerName: 'John Doe', date: '2024-07-31', total: 8.00, status: OrderStatus.InProgress, items: [{ serviceId: 'item2', name: 'Jeans', quantity: 2, price: 4.00 }], collectionAddress: '123 Main St', deliveryAddress: '123 Main St', collectionTime: 'AM Slot', deliveryTime: 'PM Slot' },
  { id: 'ord005', customerId: 'cust4', customerName: 'Mary Johnson', date: '2024-08-01', total: 299.00, status: OrderStatus.PendingCollection, items: [{ serviceId: 'plan2', name: 'Pro Plan', quantity: 1, price: 299.00 }], collectionAddress: '321 Elm St', deliveryAddress: '321 Elm St', collectionTime: 'PM Slot', deliveryTime: 'AM Slot' },
];

const simulateDelay = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 500));
}

export const getDashboardData = async () => {
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
            newCustomers: 2,
            pendingOrders: mockOrders.filter(o => o.status === OrderStatus.PendingCollection).length
        },
        weeklySales,
        recentOrders
    });
}

export const getOrders = async () => {
    return simulateDelay([...mockOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
}

export const getOrderById = async (id: string) => {
    const order = mockOrders.find(o => o.id === id);
    return simulateDelay(order);
}

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
    mockOrders = mockOrders.map(order => order.id === id ? { ...order, status } : order);
    const updatedOrder = mockOrders.find(o => o.id === id);
    return simulateDelay(updatedOrder);
}

export const createOrder = async (orderData: { customerName: string; address: string; phone: string; items: OrderItem[]; total: number; collectionTime: string; }): Promise<Order> => {
    const newOrderId = `ord${(mockOrders.length + 1).toString().padStart(3, '0')}`;
    const newCustomerId = `cust${(mockCustomers.length + 1)}`;

    const newOrder: Order = {
        id: newOrderId,
        customerId: newCustomerId,
        customerName: orderData.customerName,
        date: new Date().toISOString().split('T')[0],
        total: orderData.total,
        status: OrderStatus.PendingCollection,
        items: orderData.items,
        collectionAddress: orderData.address,
        deliveryAddress: orderData.address, // Assume same for now
        collectionTime: orderData.collectionTime,
        deliveryTime: 'TBD',
    };
    mockOrders.unshift(newOrder);
    return simulateDelay(newOrder);
}

export const getCustomers = async () => {
    return simulateDelay(mockCustomers);
}

export const getServices = async () => {
    return simulateDelay(mockServices);
}