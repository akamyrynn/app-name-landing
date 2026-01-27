"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import Link from "next/link";
import "./AdminDashboard.css";

// Types
interface Order {
    id: number;
    created_at: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address?: string;
    status: string;
    payment_status?: string;
    total_price: number;
    delivery_price?: number;
    delivery_type?: string;
    configuration: any;
}

interface Material {
    id: string;
    slug: string;
    name: string;
    description?: string;
    color: string;
    roughness: number;
    metalness: number;
    texture_color_url: string | null;
    texture_normal_url: string | null;
    texture_roughness_url: string | null;
    price_per_m2: number;
    is_active: boolean;
    sort_order: number;
}

interface Coating {
    id: string;
    code: string;
    name: string;
    description?: string;
    color: string;
    clearcoat: number;
    clearcoat_roughness: number;
    price_per_m2: number;
    is_active: boolean;
    sort_order: number;
}

interface Model3D {
    id: string;
    type: string;
    name: string;
    description?: string;
    model_url: string;
    thumbnail_url: string | null;
    default_width: number;
    default_height: number;
    price_addon: number;
    is_active: boolean;
}

interface PricingRule {
    id: string;
    rule_type: string;
    rule_key: string;
    rule_name: string;
    multiplier: number;
    fixed_addon: number;
    is_active: boolean;
}

interface DeliveryOption {
    id: string;
    slug: string;
    name: string;
    description?: string;
    price: number;
    estimated_days: string;
    is_active: boolean;
    sort_order: number;
}

interface PaymentMethod {
    id: string;
    slug: string;
    name: string;
    description?: string;
    provider: string;
    is_active: boolean;
    sort_order: number;
}

type TabType = 'orders' | 'materials' | 'coatings' | 'models' | 'pricing' | 'delivery' | 'payments' | 'settings';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<TabType>('orders');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Data states
    const [orders, setOrders] = useState<Order[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [coatings, setCoatings] = useState<Coating[]>([]);
    const [models, setModels] = useState<Model3D[]>([]);
    const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
    const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [settings, setSettings] = useState<any>({});

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<string>('material');
    const [editingItem, setEditingItem] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            switch (activeTab) {
                case 'orders':
                    const { data: ordersData, error: ordersError } = await supabase
                        .from('orders')
                        .select('*')
                        .order('created_at', { ascending: false });
                    if (ordersError) throw ordersError;
                    setOrders(ordersData || []);
                    break;
                case 'materials':
                    const { data: materialsData, error: materialsError } = await supabase
                        .from('materials')
                        .select('*')
                        .order('sort_order');
                    if (materialsError) throw materialsError;
                    setMaterials(materialsData || []);
                    break;
                case 'coatings':
                    const { data: coatingsData, error: coatingsError } = await supabase
                        .from('coatings')
                        .select('*')
                        .order('sort_order');
                    if (coatingsError) throw coatingsError;
                    setCoatings(coatingsData || []);
                    break;
                case 'models':
                    const { data: modelsData, error: modelsError } = await supabase
                        .from('models_3d')
                        .select('*')
                        .order('created_at', { ascending: false });
                    if (modelsError) throw modelsError;
                    setModels(modelsData || []);
                    break;
                case 'pricing':
                    const { data: pricingData, error: pricingError } = await supabase
                        .from('pricing_rules')
                        .select('*')
                        .order('rule_type, rule_key');
                    if (pricingError) throw pricingError;
                    setPricingRules(pricingData || []);
                    break;
                case 'delivery':
                    const { data: deliveryData, error: deliveryError } = await supabase
                        .from('delivery_options')
                        .select('*')
                        .order('sort_order');
                    if (deliveryError) throw deliveryError;
                    setDeliveryOptions(deliveryData || []);
                    break;
                case 'payments':
                    const { data: paymentsData, error: paymentsError } = await supabase
                        .from('payment_methods')
                        .select('*')
                        .order('sort_order');
                    if (paymentsError) throw paymentsError;
                    setPaymentMethods(paymentsData || []);
                    break;
                case 'settings':
                    const { data: settingsData, error: settingsError } = await supabase
                        .from('settings')
                        .select('*');
                    if (settingsError) throw settingsError;
                    const settingsObj: any = {};
                    settingsData?.forEach(s => settingsObj[s.key] = s.value);
                    setSettings(settingsObj);
                    break;
            }
        } catch (err: any) {
            setError(err.message || 'Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (id: number, status: string) => {
        const { error } = await supabase.from('orders').update({ status }).eq('id', id);
        if (!error) {
            setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
            showSuccess('Статус обновлён');
        }
    };

    const openAddModal = (type: string) => {
        setModalType(type);
        setEditingItem(null);
        setShowModal(true);
    };

    const openEditModal = (type: string, item: any) => {
        setModalType(type);
        setEditingItem(item);
        setShowModal(true);
    };

    const deleteItem = async (table: string, id: string) => {
        if (!confirm('Удалить этот элемент?')) return;
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (!error) {
            fetchData();
            showSuccess('Удалено');
        } else {
            alert('Ошибка: ' + error.message);
        }
    };

    const toggleActive = async (table: string, id: string, currentState: boolean) => {
        const { error } = await supabase.from(table).update({ is_active: !currentState }).eq('id', id);
        if (!error) fetchData();
    };

    const updatePricingRule = async (id: string, field: string, value: number) => {
        const { error } = await supabase.from('pricing_rules').update({ [field]: value }).eq('id', id);
        if (!error) {
            setPricingRules(pricingRules.map(p => p.id === id ? { ...p, [field]: value } : p));
            showSuccess('Сохранено');
        }
    };

    const tabs: { id: TabType; label: string }[] = [
        { id: 'orders', label: 'Заявки' },
        { id: 'materials', label: 'Материалы' },
        { id: 'coatings', label: 'Покрытия' },
        { id: 'models', label: '3D Модели' },
        { id: 'pricing', label: 'Расчёты' },
        { id: 'delivery', label: 'Доставка' },
        { id: 'payments', label: 'Оплата' },
        { id: 'settings', label: 'Настройки' },
    ];

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Панель управления</h1>
                <div className="admin-actions">
                    <button onClick={fetchData} className="refresh-btn">↻ Обновить</button>
                    <Link href="/" className="back-link">На сайт →</Link>
                </div>
            </header>

            {successMessage && <div className="success-banner">✓ {successMessage}</div>}
            {error && <div className="error-banner">⚠️ {error}</div>}

            <div className="admin-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : (
                <>
                    {activeTab === 'orders' && <OrdersPanel orders={orders} onStatusChange={updateOrderStatus} />}
                    {activeTab === 'materials' && (
                        <MaterialsPanel
                            materials={materials}
                            onAdd={() => openAddModal('material')}
                            onEdit={(m) => openEditModal('material', m)}
                            onDelete={(id) => deleteItem('materials', id)}
                            onToggle={(id, state) => toggleActive('materials', id, state)}
                        />
                    )}
                    {activeTab === 'coatings' && (
                        <CoatingsPanel
                            coatings={coatings}
                            onAdd={() => openAddModal('coating')}
                            onEdit={(c) => openEditModal('coating', c)}
                            onDelete={(id) => deleteItem('coatings', id)}
                            onToggle={(id, state) => toggleActive('coatings', id, state)}
                        />
                    )}
                    {activeTab === 'models' && (
                        <ModelsPanel
                            models={models}
                            onAdd={() => openAddModal('model')}
                            onEdit={(m) => openEditModal('model', m)}
                            onDelete={(id) => deleteItem('models_3d', id)}
                            onToggle={(id, state) => toggleActive('models_3d', id, state)}
                        />
                    )}
                    {activeTab === 'pricing' && (
                        <PricingPanel
                            rules={pricingRules}
                            onUpdate={updatePricingRule}
                            onToggle={(id, state) => toggleActive('pricing_rules', id, state)}
                        />
                    )}
                    {activeTab === 'delivery' && (
                        <DeliveryPanel
                            options={deliveryOptions}
                            onAdd={() => openAddModal('delivery')}
                            onEdit={(d) => openEditModal('delivery', d)}
                            onDelete={(id) => deleteItem('delivery_options', id)}
                            onToggle={(id, state) => toggleActive('delivery_options', id, state)}
                        />
                    )}
                    {activeTab === 'payments' && (
                        <PaymentsPanel
                            methods={paymentMethods}
                            onAdd={() => openAddModal('payment')}
                            onEdit={(p) => openEditModal('payment', p)}
                            onDelete={(id) => deleteItem('payment_methods', id)}
                            onToggle={(id, state) => toggleActive('payment_methods', id, state)}
                        />
                    )}
                    {activeTab === 'settings' && (
                        <SettingsPanel settings={settings} onSave={fetchData} />
                    )}
                </>
            )}

            {showModal && (
                <EditModal
                    type={modalType}
                    item={editingItem}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); fetchData(); showSuccess('Сохранено'); }}
                />
            )}
        </div>
    );
}

// ============================================
// PANEL HEADER COMPONENT
// ============================================
function PanelHeader({ title, count, onAdd, addLabel }: {
    title: string;
    count?: number;
    onAdd?: () => void;
    addLabel?: string;
}) {
    return (
        <div className="panel-header-full">
            <div className="panel-header-text">
                <h2>{title} {count !== undefined && <span className="count">({count})</span>}</h2>
            </div>
            {onAdd && (
                <button className="btn-action btn-primary" onClick={onAdd}>
                    + {addLabel || 'Добавить'}
                </button>
            )}
        </div>
    );
}

// ============================================
// ORDERS PANEL
// ============================================
function OrdersPanel({ orders, onStatusChange }: { orders: Order[], onStatusChange: (id: number, status: string) => void }) {
    return (
        <div className="glass-panel-admin">
            <PanelHeader
                title="Заявки"
                count={orders.length}
            />
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Дата</th>
                            <th>Клиент</th>
                            <th>Конфигурация</th>
                            <th>Сумма</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr><td colSpan={6} className="empty-state">Заявок пока нет</td></tr>
                        ) : orders.map((order) => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                                <td>
                                    <div className="client-info">
                                        <strong>{order.customer_name}</strong>
                                        <a href={`tel:${order.customer_phone}`}>{order.customer_phone}</a>
                                    </div>
                                </td>
                                <td>
                                    <div className="config-summary">
                                        <span>{order.configuration?.material?.name || '—'}</span>
                                        <small>{order.configuration?.width}×{order.configuration?.length}×{order.configuration?.thickness} см</small>
                                    </div>
                                </td>
                                <td><strong>{order.total_price?.toLocaleString('ru-RU')} ₽</strong></td>
                                <td>
                                    <select
                                        className="admin-select"
                                        value={order.status}
                                        onChange={(e) => onStatusChange(order.id, e.target.value)}
                                    >
                                        <option value="new">🆕 Новая</option>
                                        <option value="processing">⏳ В работе</option>
                                        <option value="paid">💳 Оплачено</option>
                                        <option value="shipped">🚚 Отправлено</option>
                                        <option value="completed">✅ Выполнено</option>
                                        <option value="cancelled">❌ Отмена</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============================================
// MATERIALS PANEL
// ============================================
function MaterialsPanel({ materials, onAdd, onEdit, onDelete, onToggle }: {
    materials: Material[];
    onAdd: () => void;
    onEdit: (m: Material) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string, state: boolean) => void;
}) {
    return (
        <div className="glass-panel-admin">
            <PanelHeader
                title="Материалы столешницы"
                count={materials.length}
                onAdd={onAdd}
                addLabel="Добавить материал"
            />
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Превью</th>
                            <th>Название</th>
                            <th>Цена/м²</th>
                            <th>Активен</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.length === 0 ? (
                            <tr><td colSpan={5} className="empty-state">Нет материалов</td></tr>
                        ) : materials.map((mat) => (
                            <tr key={mat.id} className={!mat.is_active ? 'inactive-row' : ''}>
                                <td>
                                    {mat.texture_color_url ? (
                                        <img src={mat.texture_color_url} alt={mat.name} className="texture-preview" />
                                    ) : (
                                        <div className="color-preview" style={{ backgroundColor: mat.color }} />
                                    )}
                                </td>
                                <td>
                                    <strong>{mat.name}</strong>
                                    <br /><small className="text-muted">{mat.slug}</small>
                                </td>
                                <td>{mat.price_per_m2.toLocaleString('ru-RU')} ₽</td>
                                <td>
                                    <div className={`toggle ${mat.is_active ? 'active' : ''}`} onClick={() => onToggle(mat.id, mat.is_active)} />
                                </td>
                                <td>
                                    <div className="actions-cell">
                                        <button className="btn-icon" onClick={() => onEdit(mat)} title="Редактировать">✎</button>
                                        <button className="btn-icon btn-danger" onClick={() => onDelete(mat.id)} title="Удалить">✕</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============================================
// COATINGS PANEL
// ============================================
function CoatingsPanel({ coatings, onAdd, onEdit, onDelete, onToggle }: {
    coatings: Coating[];
    onAdd: () => void;
    onEdit: (c: Coating) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string, state: boolean) => void;
}) {
    return (
        <div className="glass-panel-admin">
            <PanelHeader
                title="Покрытия OSMO"
                count={coatings.length}
                onAdd={onAdd}
                addLabel="Добавить покрытие"
            />
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Цвет</th>
                            <th>Код</th>
                            <th>Название</th>
                            <th>Глянец</th>
                            <th>Цена/м²</th>
                            <th>Активен</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coatings.length === 0 ? (
                            <tr><td colSpan={7} className="empty-state">Нет покрытий</td></tr>
                        ) : coatings.map((coat) => (
                            <tr key={coat.id} className={!coat.is_active ? 'inactive-row' : ''}>
                                <td><div className="color-preview" style={{ backgroundColor: coat.color }} /></td>
                                <td><strong>{coat.code || '—'}</strong></td>
                                <td>{coat.name}</td>
                                <td>{Math.round(coat.clearcoat * 100)}%</td>
                                <td>{coat.price_per_m2.toLocaleString('ru-RU')} ₽</td>
                                <td>
                                    <div className={`toggle ${coat.is_active ? 'active' : ''}`} onClick={() => onToggle(coat.id, coat.is_active)} />
                                </td>
                                <td>
                                    <div className="actions-cell">
                                        <button className="btn-icon" onClick={() => onEdit(coat)}>✎</button>
                                        <button className="btn-icon btn-danger" onClick={() => onDelete(coat.id)}>✕</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============================================
// MODELS PANEL
// ============================================
function ModelsPanel({ models, onAdd, onEdit, onDelete, onToggle }: {
    models: Model3D[];
    onAdd: () => void;
    onEdit: (m: Model3D) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string, state: boolean) => void;
}) {
    return (
        <div className="glass-panel-admin">
            <PanelHeader
                title="3D Модели"
                count={models.length}
                onAdd={onAdd}
                addLabel="Добавить модель"
            />
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Превью</th>
                            <th>Название</th>
                            <th>Тип</th>
                            <th>Размеры</th>
                            <th>Доплата</th>
                            <th>Активен</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {models.length === 0 ? (
                            <tr><td colSpan={7} className="empty-state">Нет моделей</td></tr>
                        ) : models.map((model) => (
                            <tr key={model.id} className={!model.is_active ? 'inactive-row' : ''}>
                                <td>
                                    <div className="model-preview">📦</div>
                                </td>
                                <td><strong>{model.name}</strong></td>
                                <td><span className="type-badge">{model.type}</span></td>
                                <td>{Math.round(model.default_width * 50)}×{Math.round(model.default_height * 50)} см</td>
                                <td>{(model.price_addon || 0).toLocaleString('ru-RU')} ₽</td>
                                <td>
                                    <div className={`toggle ${model.is_active ? 'active' : ''}`} onClick={() => onToggle(model.id, model.is_active)} />
                                </td>
                                <td>
                                    <div className="actions-cell">
                                        <button className="btn-icon" onClick={() => onEdit(model)}>✎</button>
                                        <button className="btn-icon btn-danger" onClick={() => onDelete(model.id)}>✕</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============================================
// PRICING PANEL
// ============================================
function PricingPanel({ rules, onUpdate, onToggle }: {
    rules: PricingRule[];
    onUpdate: (id: string, field: string, value: number) => void;
    onToggle: (id: string, state: boolean) => void;
}) {
    const groupedRules = rules.reduce((acc, rule) => {
        const type = rule.rule_type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(rule);
        return acc;
    }, {} as Record<string, PricingRule[]>);

    const typeLabels: Record<string, string> = {
        'thickness': 'Модификаторы толщины',
        'shape': 'Модификаторы формы',
        'cutout': 'Стоимость вырезов',
        'size': 'Модификаторы размера'
    };

    return (
        <div className="glass-panel-admin">
            <PanelHeader
                title="Правила расчёта цены"
            />
            <div className="pricing-sections">
                {Object.entries(groupedRules).map(([type, typeRules]) => (
                    <div key={type} className="pricing-section">
                        <h3 className="pricing-section-title">{typeLabels[type] || type}</h3>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Правило</th>
                                    <th>Множитель</th>
                                    <th>Добавка (₽)</th>
                                    <th>Активно</th>
                                </tr>
                            </thead>
                            <tbody>
                                {typeRules.map((rule) => (
                                    <tr key={rule.id}>
                                        <td><strong>{rule.rule_name}</strong></td>
                                        <td>
                                            <input
                                                type="number"
                                                className="inline-input"
                                                value={rule.multiplier}
                                                step="0.05"
                                                min="0"
                                                max="10"
                                                onChange={(e) => onUpdate(rule.id, 'multiplier', parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="inline-input"
                                                value={rule.fixed_addon}
                                                step="100"
                                                onChange={(e) => onUpdate(rule.id, 'fixed_addon', parseInt(e.target.value))}
                                            />
                                        </td>
                                        <td>
                                            <div className={`toggle ${rule.is_active ? 'active' : ''}`} onClick={() => onToggle(rule.id, rule.is_active)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================
// DELIVERY PANEL
// ============================================
function DeliveryPanel({ options, onAdd, onEdit, onDelete, onToggle }: {
    options: DeliveryOption[];
    onAdd: () => void;
    onEdit: (d: DeliveryOption) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string, state: boolean) => void;
}) {
    return (
        <div className="glass-panel-admin">
            <PanelHeader
                title="Способы доставки"
                count={options.length}
                onAdd={onAdd}
                addLabel="Добавить способ"
            />
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th>Описание</th>
                            <th>Цена</th>
                            <th>Сроки</th>
                            <th>Активен</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {options.length === 0 ? (
                            <tr><td colSpan={6} className="empty-state">Нет способов доставки</td></tr>
                        ) : options.map((opt) => (
                            <tr key={opt.id} className={!opt.is_active ? 'inactive-row' : ''}>
                                <td><strong>{opt.name}</strong></td>
                                <td><small className="text-muted">{opt.description || '—'}</small></td>
                                <td>{opt.price === 0 ? 'Бесплатно' : `${opt.price.toLocaleString('ru-RU')} ₽`}</td>
                                <td>{opt.estimated_days || '—'}</td>
                                <td>
                                    <div className={`toggle ${opt.is_active ? 'active' : ''}`} onClick={() => onToggle(opt.id, opt.is_active)} />
                                </td>
                                <td>
                                    <div className="actions-cell">
                                        <button className="btn-icon" onClick={() => onEdit(opt)}>✎</button>
                                        <button className="btn-icon btn-danger" onClick={() => onDelete(opt.id)}>✕</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Integration Instructions */}
            <div className="integration-box">
                <h4>📋 Как подключить расчёт доставки через СДЭК</h4>
                <ol>
                    <li>Зарегистрируйтесь на <code>cdek.ru</code> как ИМ (интернет-магазин)</li>
                    <li>В личном кабинете СДЭК → Настройки → API → Создать интеграцию</li>
                    <li>Скопируйте <code>Account</code> и <code>Secure password</code></li>
                    <li>Передайте ключи разработчику для настройки сервера</li>
                    <li>После настройки включите способ доставки в таблице выше</li>
                </ol>
            </div>
        </div>
    );
}

// ============================================
// PAYMENTS PANEL
// ============================================
function PaymentsPanel({ methods, onAdd, onEdit, onDelete, onToggle }: {
    methods: PaymentMethod[];
    onAdd: () => void;
    onEdit: (p: PaymentMethod) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string, state: boolean) => void;
}) {
    return (
        <div className="glass-panel-admin">
            <PanelHeader
                title="Способы оплаты"
                count={methods.length}
                onAdd={onAdd}
                addLabel="Добавить способ"
            />
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th>Провайдер</th>
                            <th>Описание</th>
                            <th>Статус</th>
                            <th>Активен</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {methods.length === 0 ? (
                            <tr><td colSpan={6} className="empty-state">Нет способов оплаты</td></tr>
                        ) : methods.map((method) => (
                            <tr key={method.id} className={!method.is_active ? 'inactive-row' : ''}>
                                <td><strong>{method.name}</strong></td>
                                <td><span className="type-badge">{method.provider}</span></td>
                                <td><small className="text-muted">{method.description || '—'}</small></td>
                                <td>
                                    {method.provider === 'manual' ? (
                                        <span className="status-badge completed">Готов</span>
                                    ) : (
                                        <span className="status-badge new">Настроить API</span>
                                    )}
                                </td>
                                <td>
                                    <div className={`toggle ${method.is_active ? 'active' : ''}`} onClick={() => onToggle(method.id, method.is_active)} />
                                </td>
                                <td>
                                    <div className="actions-cell">
                                        <button className="btn-icon" onClick={() => onEdit(method)}>✎</button>
                                        <button className="btn-icon btn-danger" onClick={() => onDelete(method.id)}>✕</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Integration Instructions */}
            <div className="integration-box">
                <h4>📋 Как подключить онлайн-оплату (ЮKassa)</h4>
                <ol>
                    <li>Зарегистрируйтесь на <code>yookassa.ru</code> и подтвердите юрлицо/ИП</li>
                    <li>В личном кабинете ЮKassa → Интеграция → Ключи API</li>
                    <li>Скопируйте <code>shopId</code> и <code>Секретный ключ</code></li>
                    <li>Передайте ключи разработчику для настройки сервера</li>
                    <li>После настройки включите способ оплаты в таблице выше</li>
                </ol>
            </div>
        </div>
    );
}

// ============================================
// SETTINGS PANEL
// ============================================
function SettingsPanel({ settings, onSave }: { settings: any; onSave: () => void }) {
    const [localSettings, setLocalSettings] = useState(settings);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const saveSettings = async () => {
        setSaving(true);
        try {
            for (const [key, value] of Object.entries(localSettings)) {
                await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() });
            }
            onSave();
        } catch (err) {
            alert('Ошибка сохранения');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key: string, field: string, value: any) => {
        setLocalSettings({
            ...localSettings,
            [key]: { ...localSettings[key], [field]: value }
        });
    };

    return (
        <div className="glass-panel-admin">
            <PanelHeader
                title="Технические ограничения"
            />
            <div className="settings-content">
                <div className="settings-section">
                    <h3>Ограничения размеров (см)</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Мин. ширина</label>
                            <input
                                type="number"
                                className="form-input"
                                value={localSettings.dimensions?.min_width || 60}
                                onChange={(e) => updateSetting('dimensions', 'min_width', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Макс. ширина</label>
                            <input
                                type="number"
                                className="form-input"
                                value={localSettings.dimensions?.max_width || 300}
                                onChange={(e) => updateSetting('dimensions', 'max_width', parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Мин. глубина</label>
                            <input
                                type="number"
                                className="form-input"
                                value={localSettings.dimensions?.min_length || 40}
                                onChange={(e) => updateSetting('dimensions', 'min_length', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Макс. глубина</label>
                            <input
                                type="number"
                                className="form-input"
                                value={localSettings.dimensions?.max_length || 200}
                                onChange={(e) => updateSetting('dimensions', 'max_length', parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                <div className="settings-actions">
                    <button className="btn-action btn-primary" onClick={saveSettings} disabled={saving}>
                        {saving ? 'Сохранение...' : 'Сохранить настройки'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// EDIT MODAL (Simplified - reuse for all types)
// ============================================
function EditModal({ type, item, onClose, onSave }: {
    type: string;
    item: any;
    onClose: () => void;
    onSave: () => void;
}) {
    const [formData, setFormData] = useState<any>(item || getDefaultFormData(type));
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    function getDefaultFormData(type: string) {
        switch (type) {
            case 'material':
                return { name: '', slug: '', color: '#8B7355', roughness: 0.7, metalness: 0, price_per_m2: 15000, texture_color_url: '', texture_normal_url: '', texture_roughness_url: '', is_active: true, sort_order: 0 };
            case 'coating':
                return { name: '', code: '', color: '#F5E6D3', clearcoat: 0.4, clearcoat_roughness: 0.5, price_per_m2: 2500, is_active: true, sort_order: 0 };
            case 'model':
                return { name: '', type: 'sink', model_url: '', thumbnail_url: '', default_width: 0.6, default_height: 0.8, price_addon: 0, is_active: true };
            case 'delivery':
                return { slug: '', name: '', description: '', price: 0, estimated_days: '', is_active: true, sort_order: 0 };
            case 'payment':
                return { slug: '', name: '', description: '', provider: 'manual', is_active: true, sort_order: 0 };
            default:
                return {};
        }
    }

    const getTableName = () => {
        switch (type) {
            case 'material': return 'materials';
            case 'coating': return 'coatings';
            case 'model': return 'models_3d';
            case 'delivery': return 'delivery_options';
            case 'payment': return 'payment_methods';
            default: return '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const table = getTableName();
            if (item?.id) {
                const { error } = await supabase.from(table).update(formData).eq('id', item.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from(table).insert([formData]);
                if (error) throw error;
            }
            onSave();
        } catch (err: any) {
            alert('Ошибка: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const bucket = field.includes('model') ? 'models' : 'textures';
            const fileName = `${Date.now()}_${file.name}`;
            const { error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true });
            if (error) throw error;
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
            setFormData({ ...formData, [field]: urlData.publicUrl });
        } catch (err: any) {
            alert('Ошибка загрузки: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    // Drag & Drop folder handler - auto-detects texture types
    const handleFolderDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const items = e.dataTransfer.items;
        if (!items) return;

        setUploading(true);
        const updates: any = {};
        const files: File[] = [];

        // Collect all files
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) files.push(file);
            }
        }

        // Also handle regular file input multiple
        if (e.dataTransfer.files) {
            for (let i = 0; i < e.dataTransfer.files.length; i++) {
                const file = e.dataTransfer.files[i];
                if (!files.find(f => f.name === file.name)) {
                    files.push(file);
                }
            }
        }

        try {
            for (const file of files) {
                const fileName = file.name.toLowerCase();
                const timestamp = Date.now();
                const uploadName = `${timestamp}_${file.name}`;

                // Determine which texture type based on filename
                let field: string | null = null;
                if (fileName.includes('color') || fileName.includes('diffuse') || fileName.includes('albedo')) {
                    field = 'texture_color_url';
                } else if (fileName.includes('normal')) {
                    field = 'texture_normal_url';
                } else if (fileName.includes('roughness') || fileName.includes('rough')) {
                    field = 'texture_roughness_url';
                }

                if (field) {
                    const { error } = await supabase.storage.from('textures').upload(uploadName, file, { upsert: true });
                    if (error) throw error;
                    const { data: urlData } = supabase.storage.from('textures').getPublicUrl(uploadName);
                    updates[field] = urlData.publicUrl;
                }

                // Try to extract material name from filename
                if (!updates.name && fileName.includes('color')) {
                    // Extract name like "Wood051" from "Wood051_1K-JPG_Color.jpg"
                    const match = file.name.match(/^([A-Za-z]+\d+)/);
                    if (match) {
                        updates.name = match[1];
                        updates.slug = match[1].toLowerCase();
                    }
                }
            }

            // Update form with all found textures
            setFormData({ ...formData, ...updates });

            const count = Object.keys(updates).filter(k => k.includes('texture')).length;
            if (count > 0) {
                alert(`✅ Загружено ${count} текстур${count > 1 ? 'ы' : 'а'}!`);
            }
        } catch (err: any) {
            alert('Ошибка: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{item ? 'Редактировать' : 'Добавить'}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* Common fields */}
                        <div className="form-group">
                            <label className="form-label">Название</label>
                            <input type="text" className="form-input" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        </div>

                        {(type === 'material' || type === 'delivery' || type === 'payment') && (
                            <div className="form-group">
                                <label className="form-label">Slug (URL-ключ)</label>
                                <input type="text" className="form-input" value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} required />
                            </div>
                        )}

                        {type === 'coating' && (
                            <div className="form-group">
                                <label className="form-label">Код OSMO</label>
                                <input type="text" className="form-input" value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                            </div>
                        )}

                        {(type === 'material' || type === 'coating') && (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Цвет</label>
                                        <input type="color" className="form-input" style={{ height: 44 }} value={formData.color || '#888888'} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Цена за м² (₽)</label>
                                        <input type="number" className="form-input" value={formData.price_per_m2 || 0} onChange={(e) => setFormData({ ...formData, price_per_m2: parseInt(e.target.value) })} />
                                    </div>
                                </div>
                            </>
                        )}

                        {type === 'material' && (
                            <>
                                {/* DRAG & DROP ZONE */}
                                <div
                                    className="form-group"
                                    onDrop={handleFolderDrop}
                                    onDragOver={handleDragOver}
                                >
                                    <label className="form-label">🚀 Быстрая загрузка (перетащите все файлы)</label>
                                    <div
                                        className="file-upload"
                                        style={{
                                            borderColor: 'rgba(34, 197, 94, 0.5)',
                                            background: 'rgba(34, 197, 94, 0.05)',
                                            minHeight: 80
                                        }}
                                    >
                                        <div className="file-upload-label" style={{ color: '#86efac' }}>
                                            {uploading ? '⏳ Загрузка текстур...' : '📁 Перетащите сюда файлы *_Color.jpg, *_Normal.jpg, *_Roughness.jpg'}
                                        </div>
                                        <small style={{ color: '#888', marginTop: 8, display: 'block' }}>
                                            Автоматически определит тип текстуры по имени файла
                                        </small>
                                    </div>
                                </div>

                                {/* Preview of current texture */}
                                {formData.texture_color_url && (
                                    <div className="form-group">
                                        <label className="form-label">Текущий материал</label>
                                        <img
                                            src={formData.texture_color_url}
                                            alt="Preview"
                                            style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)' }}
                                        />
                                    </div>
                                )}

                                {/* Color Texture */}
                                <div className="form-group">
                                    <label className="form-label">📷 Текстура Color (основной цвет)</label>
                                    <div className="file-upload">
                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'texture_color_url')} />
                                        <div className="file-upload-label">{uploading ? 'Загрузка...' : 'Нажмите для загрузки'}</div>
                                    </div>
                                    {formData.texture_color_url && <small className="text-muted">✓ {formData.texture_color_url.split('/').pop()}</small>}
                                </div>

                                {/* Normal Texture */}
                                <div className="form-group">
                                    <label className="form-label">🗺️ Текстура Normal (рельеф)</label>
                                    <div className="file-upload">
                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'texture_normal_url')} />
                                        <div className="file-upload-label">{uploading ? 'Загрузка...' : 'Нажмите для загрузки'}</div>
                                    </div>
                                    {formData.texture_normal_url && <small className="text-muted">✓ {formData.texture_normal_url.split('/').pop()}</small>}
                                </div>

                                {/* Roughness Texture */}
                                <div className="form-group">
                                    <label className="form-label">🔲 Текстура Roughness (шероховатость)</label>
                                    <div className="file-upload">
                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'texture_roughness_url')} />
                                        <div className="file-upload-label">{uploading ? 'Загрузка...' : 'Нажмите для загрузки'}</div>
                                    </div>
                                    {formData.texture_roughness_url && <small className="text-muted">✓ {formData.texture_roughness_url.split('/').pop()}</small>}
                                </div>

                                {/* Roughness value */}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Шероховатость (0-1)</label>
                                        <input type="number" className="form-input" min="0" max="1" step="0.1" value={formData.roughness || 0.7} onChange={(e) => setFormData({ ...formData, roughness: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Порядок сортировки</label>
                                        <input type="number" className="form-input" value={formData.sort_order || 0} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })} />
                                    </div>
                                </div>
                            </>
                        )}

                        {type === 'model' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Тип</label>
                                    <select className="form-input" value={formData.type || 'sink'} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="sink">Мойка</option>
                                        <option value="faucet">Смеситель</option>
                                        <option value="cooktop">Варочная панель</option>
                                        <option value="grill">Гриль</option>
                                        <option value="other">Другое</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">3D Модель (GLB)</label>
                                    <div className="file-upload">
                                        <input type="file" accept=".glb,.gltf" onChange={(e) => handleFileUpload(e, 'model_url')} />
                                        <div className="file-upload-label">{uploading ? 'Загрузка...' : 'Выберите GLB файл'}</div>
                                    </div>
                                    {formData.model_url && <small className="text-muted">Файл: {formData.model_url.split('/').pop()}</small>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Доплата за аксессуар (₽)</label>
                                    <input type="number" className="form-input" value={formData.price_addon || 0} onChange={(e) => setFormData({ ...formData, price_addon: parseInt(e.target.value) })} />
                                </div>
                            </>
                        )}

                        {type === 'delivery' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Описание</label>
                                    <input type="text" className="form-input" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Цена (₽)</label>
                                        <input type="number" className="form-input" value={formData.price || 0} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Сроки</label>
                                        <input type="text" className="form-input" value={formData.estimated_days || ''} onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })} placeholder="2-3 дня" />
                                    </div>
                                </div>
                            </>
                        )}

                        {type === 'payment' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Описание</label>
                                    <input type="text" className="form-input" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Провайдер</label>
                                    <select className="form-input" value={formData.provider || 'manual'} onChange={(e) => setFormData({ ...formData, provider: e.target.value })}>
                                        <option value="manual">Ручная оплата</option>
                                        <option value="yookassa">ЮKassa</option>
                                        <option value="tinkoff">Тинькофф</option>
                                        <option value="stripe">Stripe</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-action btn-secondary" onClick={onClose}>Отмена</button>
                        <button type="submit" className="btn-action btn-primary" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
