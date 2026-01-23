"use client";

import { generateTechnicalDrawingPDF } from "../utils/technicalDrawingGenerator";
import { useEffect, useState } from "react";
import { supabase, Order } from "../utils/supabaseClient";
import Link from "next/link";
import "./AdminDashboard.css";

export default function AdminPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            // Check if credentials are set (just a helper for the user)
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
                throw new Error("Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
            }

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setOrders(data || []);
        } catch (err: any) {
            console.error("Error fetching orders:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Refresh local state
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
        } catch (err: any) {
            alert("Error updating status: " + err.message);
        }
    };

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>CRM / Заявки</h1>
                <div className="admin-actions">
                    <button onClick={fetchOrders} className="refresh-btn">Обновить</button>
                    <Link href="/" className="back-link">На сайт</Link>
                </div>
            </header>

            {error && (
                <div className="error-banner">
                    <p>⚠️ {error}</p>
                    <p className="text-sm">Создайте файл <code>.env.local</code> с ключами Supabase.</p>
                </div>
            )}

            {loading ? (
                <div className="loading">Загрузка заявок...</div>
            ) : (
                <div className="table-responsive">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Дата</th>
                                <th>Клиент</th>
                                <th>Конфигурация</th>


                                <th>Стоимость</th>
                                <th>Статус</th>
                                <th>Чертеж</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="empty-state">Нет заявок</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className={`status-${order.status}`}>
                                        <td>#{order.id}</td>
                                        <td>{new Date(order.created_at).toLocaleString('ru-RU')}</td>
                                        <td>
                                            <div className="client-info">
                                                <strong>{order.customer_name}</strong>
                                                <a href={`tel:${order.customer_phone}`}>{order.customer_phone}</a>
                                                <a href={`mailto:${order.customer_email}`}>{order.customer_email}</a>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="config-summary">
                                                <span>{order.configuration.material?.name || "Неизвестный материал"}</span>
                                                <span className="capitalize">{order.configuration.shape}</span>
                                                <small>{order.configuration.width}x{order.configuration.length}x{order.configuration.thickness} см</small>
                                            </div>
                                        </td>
                                        <td>{order.total_price.toLocaleString('ru-RU')} ₽</td>
                                        <td>
                                            <span className={`status-badge ${order.status}`}>{order.status}</span>
                                        </td>
                                        <td>
                                            <button
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                onClick={async () => {
                                                    const config = {
                                                        ...order.configuration,
                                                        // Convert stored CM thickness to 3D units (generator expects 3D units)
                                                        thickness: order.configuration.thickness / 50,
                                                        // Fallback for old orders without coating
                                                        coating: order.configuration.coating || { name: 'Не указано', id: 'none', color: '#fff' },
                                                        price: order.total_price
                                                    };
                                                    await generateTechnicalDrawingPDF(config, order.id);
                                                }}
                                            >
                                                Скачать PDF
                                            </button>
                                        </td>
                                        <td>
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className="status-select"
                                            >
                                                <option value="new">Новая</option>
                                                <option value="processing">В работе</option>
                                                <option value="completed">Выполнена</option>
                                                <option value="cancelled">Отмена</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
