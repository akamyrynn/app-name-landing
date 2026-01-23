"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../utils/supabaseClient";
import "./CheckoutModal.css";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: any;
    totalPrice: number;
}

export default function CheckoutModal({ isOpen, onClose, config, totalPrice }: CheckoutModalProps) {
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('orders').insert([
                {
                    customer_name: formData.name,
                    customer_email: formData.email,
                    customer_phone: formData.phone,
                    status: 'new',
                    total_price: totalPrice,
                    configuration: config,
                    delivery_type: 'pickup',
                    payment_method: 'card',
                }
            ]);

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setFormData({ name: "", email: "", phone: "" });
            }, 3000);
        } catch (err: any) {
            alert("Ошибка при отправке: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getShapeName = (shape: string) => {
        const shapes: Record<string, string> = {
            rectangle: "Прямоугольная",
            round: "Круглая",
            trapezoid: "Трапеция",
            custom: "Нестандартная"
        };
        return shapes[shape] || shape;
    };

    return createPortal(
        <div className="checkout-overlay">
            <div className="checkout-backdrop" onClick={onClose} />

            <div className="checkout-modal">
                {/* Close button */}
                <button className="checkout-close" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {success ? (
                    <div className="checkout-success">
                        <div className="success-icon">✓</div>
                        <h2>Заявка отправлена!</h2>
                        <p>Мы свяжемся с вами в ближайшее время</p>
                    </div>
                ) : (
                    <>
                        <div className="checkout-header">
                            <h2>Оформление заказа</h2>
                            <p>Проверьте параметры и оставьте контакты</p>
                        </div>

                        <div className="checkout-content">
                            {/* Order Summary */}
                            <div className="checkout-summary">
                                <h3>Ваш заказ</h3>

                                <div className="summary-item">
                                    <span className="summary-label">Материал</span>
                                    <span className="summary-value">{config.material?.name}</span>
                                </div>

                                <div className="summary-item">
                                    <span className="summary-label">Форма</span>
                                    <span className="summary-value">{getShapeName(config.shape)}</span>
                                </div>

                                <div className="summary-item">
                                    <span className="summary-label">Размеры</span>
                                    <span className="summary-value">{config.width} × {config.length} × {config.thickness} см</span>
                                </div>

                                {config.cutouts?.length > 0 && (
                                    <div className="summary-item">
                                        <span className="summary-label">Вырезы</span>
                                        <span className="summary-value">{config.cutouts.length} шт.</span>
                                    </div>
                                )}

                                <div className="summary-total">
                                    <span>Итого</span>
                                    <span className="total-price">{totalPrice.toLocaleString('ru-RU')} ₽</span>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <form className="checkout-form" onSubmit={handleSubmit}>
                                <h3>Контактные данные</h3>

                                <div className="form-field">
                                    <label>Имя</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Как к вам обращаться?"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Телефон</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="+7 (999) 000-00-00"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                                        Отмена
                                    </button>
                                    <button type="submit" className="btn-submit" disabled={loading}>
                                        {loading ? "Отправка..." : "Отправить заявку"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}
