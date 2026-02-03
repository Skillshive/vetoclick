import MainLayout from '@/layouts/MainLayout';
import React, { useState, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Button, Card, Input } from '@/components/ui';
import { useToast } from '@/components/common/Toast/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Page } from '@/components/shared/Page';
import { BreadcrumbItem, Breadcrumbs } from '@/components/shared/Breadcrumbs';
import ReactSelect from '@/components/ui/ReactSelect';
import { DatePicker } from '@/components/shared/form/Datepicker';
import { CalendarIcon, BuildingStorefrontIcon, TagIcon, CurrencyDollarIcon, TruckIcon, PercentBadgeIcon, CreditCardIcon, UserIcon, TrashIcon, PlusIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { ListOrderedIcon } from 'lucide-react';
import { orderSchema, OrderFormValues as OrderFormValuesType } from '@/schemas/orderSchema';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface Supplier {
  uuid: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface OrderProduct {
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  tva: number;
  reduction_taux: number;
  total_price: number;
}

interface Order {
  uuid: string;
  reference: string;
  supplier: {
    uuid: string;
    name: string;
  };
  order_type: string;
  status: string;
  subtotal: string;
  tax_amount: string;
  shipping_cost: string;
  discount_amount: string;
  total_amount: string;
  discount_percentage: string;
  payment_due_date: string;
  payment_method: string;
  order_date: string;
  confirmed_delivery_date: string;
  products?: OrderProduct[];
}

interface EditOrderProps {
  order: Order;
  suppliers: Supplier[];
  products: Product[];
}

interface OrderFormValues {
  reference: string;
  supplier_id: string;
  order_type: string;
  subtotal: string;
  tax_amount: string;
  shipping_cost: string;
  discount_amount: string;
  total_amount: string;
  discount_percentage: string;
  payment_due_date: string;
  payment_method: string;
  order_date: string;
  confirmed_delivery_date: string;
  products: OrderProduct[];
}

const EditOrder: React.FC<EditOrderProps> = ({ order, suppliers, products: initialProducts }) => {
    const { showToast } = useToast();
    const { t } = useTranslation();
    const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof OrderFormValues, string>>>({});
    const [products] = useState<Product[]>(initialProducts || []);

    // Map order_type and payment_method back to numeric values
    const getOrderTypeValue = (text: string): string => {
        const mapping: Record<string, string> = {
            'regular': '1',
            'emergency': '2',
        };
        return mapping[text] || '';
    };

    const getPaymentMethodValue = (text: string): string => {
        const mapping: Record<string, string> = {
            'bank_transfer': '1',
            'check': '2',
            'cash': '3',
            'transfer': '4',
        };
        return mapping[text] || '';
    };

    const { data, setData, put, processing, errors, reset } = useForm<OrderFormValues>({
        reference: order.reference || '',
        supplier_id: order.supplier?.uuid || '',
        order_type: getOrderTypeValue(order.order_type) || '',
        subtotal: order.subtotal?.replace(/,/g, '') || '0',
        tax_amount: order.tax_amount?.replace(/,/g, '') || '0',
        shipping_cost: order.shipping_cost?.replace(/,/g, '') || '0',
        discount_amount: order.discount_amount?.replace(/,/g, '') || '0',
        total_amount: order.total_amount?.replace(/,/g, '') || '0',
        discount_percentage: order.discount_percentage || '0',
        payment_due_date: order.payment_due_date || '',
        payment_method: getPaymentMethodValue(order.payment_method) || '',
        order_date: order.order_date || '',
        confirmed_delivery_date: order.confirmed_delivery_date || '',
        products: order.products || [],
    });

    // Calculate totals whenever products, discount, or shipping changes
    useEffect(() => {
        let subtotal = 0;
        let totalTax = 0;

        // Calculate subtotal and tax from products
        data.products.forEach((product) => {
            subtotal += product.total_price || 0;
            totalTax += (product.total_price * (product.tva / 100)) || 0;
        });

        // Apply discount
        const discountPercentage = parseFloat(data.discount_percentage as string) || 0;
        const discountAmount = (subtotal * discountPercentage) / 100;

        // Add shipping
        const shippingCost = parseFloat(data.shipping_cost as string) || 0;

        // Calculate final total
        const totalAmount = subtotal - discountAmount + totalTax + shippingCost;

        const newSubtotal = subtotal.toFixed(2);
        const newTaxAmount = totalTax.toFixed(2);
        const newDiscountAmount = discountAmount.toFixed(2);
        const newTotalAmount = totalAmount.toFixed(2);

        // Only update if values have changed to prevent infinite loop
        if (
            data.subtotal !== newSubtotal ||
            data.tax_amount !== newTaxAmount ||
            data.discount_amount !== newDiscountAmount ||
            data.total_amount !== newTotalAmount
        ) {
            setData((prev: OrderFormValues) => ({
                ...prev,
                subtotal: newSubtotal,
                tax_amount: newTaxAmount,
                discount_amount: newDiscountAmount,
                total_amount: newTotalAmount,
            }));
        }
    }, [data.products, data.discount_percentage, data.shipping_cost, data.subtotal, data.tax_amount, data.discount_amount, data.total_amount]);

    const addProduct = () => {
        setData('products', [
            ...data.products,
            {
                product_id: '',
                quantity: 1,
                unit_price: 0,
                tva: 0,
                reduction_taux: 0,
                total_price: 0,
            }
        ]);
    };

    const removeProduct = (index: number) => {
        const newProducts = data.products.filter((_, i) => i !== index);
        setData('products', newProducts);
    };

    const updateProduct = (index: number, field: keyof OrderProduct, value: any) => {
        const newProducts = [...data.products];
        newProducts[index] = {
            ...newProducts[index],
            [field]: value,
        };

        // Recalculate product total
        if (field === 'quantity' || field === 'unit_price' || field === 'reduction_taux') {
            const product = newProducts[index];
            const quantity = parseFloat(product.quantity as any) || 0;
            const unitPrice = parseFloat(product.unit_price as any) || 0;
            const reductionRate = parseFloat(product.reduction_taux as any) || 0;

            const baseTotal = quantity * unitPrice;
            const reduction = (baseTotal * reductionRate) / 100;
            product.total_price = baseTotal - reduction;
        }

        setData('products', newProducts);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate with Zod
        const validationData = {
            ...data,
            products: data.products.map(p => ({
                ...p,
                quantity: Number(p.quantity),
                unit_price: Number(p.unit_price),
                tva: Number(p.tva),
                reduction_taux: Number(p.reduction_taux),
                total_price: Number(p.total_price),
            }))
        };

        const result = orderSchema.safeParse(validationData);
        
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            const newErrors: Partial<Record<keyof OrderFormValues, string>> = {};
            
            for (const key in errors) {
                const errorMessages = errors[key as keyof typeof errors];
                if (errorMessages && errorMessages.length > 0) {
                    newErrors[key as keyof OrderFormValues] = t(errorMessages[0]);
                }
            }
            
            setValidationErrors(newErrors);
            showToast({
                type: 'error',
                message: t('common.validation_error') || 'Please fix the validation errors',
                duration: 3000,
            });
            return;
        }

        put(route('orders.update', order.uuid), {
            onSuccess: () => {
                showToast({
                    type: 'success',
                    message: t('common.order_updated_success') || 'Order updated successfully',
                    duration: 3000,
                });
                router.visit(route('orders.index'));
            },
            onError: (errors: Record<string, string>) => {
                const newErrors: Partial<Record<keyof OrderFormValues, string>> = {};
                for (const key in errors) {
                    newErrors[key as keyof OrderFormValues] = t(errors[key]!);
                }
                setValidationErrors(newErrors);
                showToast({
                    type: 'error',
                    message: t('common.order_update_error') || 'Failed to update order',
                    duration: 3000,
                });
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('common.orders') || 'Orders', path: route('orders.index') },
        { title: t('common.edit_order') || 'Edit Order'},
    ];

    const supplierOptions = suppliers.map(supplier => ({
        value: supplier.uuid,
        label: supplier.name,
    }));

    const orderTypeOptions = [
        { value:'1', label: t('common.regular')},
        { value: '2', label: t('common.emergency')  },
    ];

    const paymentMethodOptions = [
        { value: '1', label: t('common.bank_transfer')  },
        { value: '2', label: t('common.check')  },
        { value: '3', label: t('common.cash')  },
        { value: '4', label: t('common.transfer')  },
    ];

    // Check if order can be modified
    const canModify = order.status === 'draft' || order.status === 'pending';

    return (
       <MainLayout>
             <Page 
               title={t("common.metadata_titles.orders_edit") || "Edit Order"}
               description={t("common.page_descriptions.orders_edit") || "Edit order details including products, quantities, and status."}
             >
               <div className="transition-content px-(--margin-x) pb-6">
                 <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
                   <div className="flex items-center gap-1">
                     <div>
                       <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
                       <p className="text-sm text-gray-500 dark:text-gray-400">
                         {t('common.edit_order_description') || 'Edit order details'}
                       </p>
                     </div>
                   </div>
                 </div>

                 {!canModify && (
                   <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                     <p className="text-yellow-800 dark:text-yellow-200">
                       {t('common.order_not_modifiable') || 'This order cannot be modified as it has been confirmed or is beyond the draft/pending stage.'}
                     </p>
                   </div>
                 )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
                                  <div className="col-span-12">
                                    <Card className="p-4 sm:px-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <Input
                                    type="text"
                                    placeholder={t('common.reference') || 'Reference'}
                                    label={t('common.reference') || 'Reference'}
                                    className="rounded-xl"
                                    prefix={<TagIcon className="size-4.5" />}
                                    value={data.reference}
                                    onChange={(e) => setData('reference', e.target.value)}
                                    disabled={true}

                                />
                                {validationErrors.reference && <p className="text-red-500 text-sm mt-1">{validationErrors.reference}</p>}
                            </div>

                            <div>
                                <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {t('common.supplier') || 'Supplier'}
                                    <span className="text-red-500 mx-1">*</span>
                                </label>
                                <ReactSelect
                                    id="supplier_id"
                                    value={
                                        data.supplier_id
                                            ? {
                                                value: data.supplier_id,
                                                label: supplierOptions?.find(s => s.value === data.supplier_id)?.label || ''
                                            }
                                            : null
                                    }
                                    onChange={(option) => {
                                        if (option && !Array.isArray(option)) {
                                            setData('supplier_id', option.value);
                                        } else {
                                            setData('supplier_id', '');
                                        } 
                                    }}
                                    options={[
                                        { value: '', label: t('common.select_supplier') || 'Select Supplier' },
                                        ...supplierOptions
                                    ]}
                                    placeholder={t('common.select_supplier') || 'Select Supplier'}
                                    className={errors?.supplier_id ? 'border-red-500' : ''}
                                    error={!!errors?.supplier_id}
                                    leftIcon={<BuildingStorefrontIcon className="size-4.5" />}
                                    isRequired={true}
                                    isDisabled={!canModify}
                                />
                                {validationErrors.supplier_id && <p className="text-red-500 text-sm mt-1">{validationErrors.supplier_id}</p>}
                            </div>

                            <div>
                                <label htmlFor="order_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {t('common.order_type') || 'Order Type'}
                                    <span className="text-red-500 mx-1">*</span>
                                </label>
                                <ReactSelect
                                    id="order_type"
                                    value={
                                        data.order_type
                                            ? {
                                                value: data.order_type,
                                                label: orderTypeOptions?.find(t => t.value === data.order_type)?.label || ''
                                            }
                                            : null
                                    }
                                    onChange={(option) => {
                                        if (option && !Array.isArray(option)) {
                                            setData('order_type', option.value);
                                        } else {
                                            setData('order_type', '');
                                        }
                                    }}
                                    options={[
                                        { value: '', label: t('common.select_order_type') || 'Select Order Type' },
                                        ...orderTypeOptions,
                                    ]}
                                    placeholder={t('common.select_order_type') || 'Select Order Type'}
                                    className={errors?.order_type ? 'border-red-500' : ''}
                                    error={!!errors?.order_type}
                                    isRequired={true}
                                    leftIcon={<ListOrderedIcon className="size-4.5" />}
                                    isDisabled={!canModify}
                                />
                                {validationErrors.order_type && <p className="text-red-500 text-sm mt-1">{validationErrors.order_type}</p>}
                            </div>

                            <div>
                                <DatePicker
                                    value={data.order_date || ''}
                                    onChange={(dates: Date[]) => {
                                        if (dates && dates.length > 0) {
                                            const date = dates[0];
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            setData('order_date', `${year}-${month}-${day}`);
                                        } else {
                                            setData('order_date', '');
                                        }
                                    }}
                                    placeholderText={t('common.select_order_date') || 'Select Order Date'}
                                    label={t('common.order_date') || 'Order Date'}
                                    className="rounded-xl"
                                    prefix={<CalendarIcon className="size-4.5" />}
                                    options={{
                                        dateFormat: 'Y-m-d',
                                      }}
                                    disabled={!canModify}
                                />
                                {validationErrors.order_date && <p className="text-red-500 text-sm mt-1">{validationErrors.order_date}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
                          
                            <div>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder={t('common.shipping_cost') || 'Shipping Cost'}
                                    label={t('common.shipping_cost') || 'Shipping Cost'}
                                    className="rounded-xl"
                                    prefix={<TruckIcon className="size-4.5" />}
                                    value={data.shipping_cost}
                                    onChange={(e) => setData('shipping_cost', e.target.value)}
                                    disabled={!canModify}
                                />
                                {validationErrors.shipping_cost && <p className="text-red-500 text-sm mt-1">{validationErrors.shipping_cost}</p>}
                            </div>

                            <div>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder={t('common.discount_percentage') || 'Discount Percentage'}
                                    label={t('common.discount_percentage') || 'Discount %'}
                                    className="rounded-xl"
                                    prefix={<PercentBadgeIcon className="size-4.5" />}
                                    value={data.discount_percentage}
                                    onChange={(e) => setData('discount_percentage', e.target.value)}
                                    disabled={!canModify}
                                />
                                {validationErrors.discount_percentage && <p className="text-red-500 text-sm mt-1">{validationErrors.discount_percentage}</p>}
                            </div>

                            <div>
                                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {t('common.payment_method') || 'Payment Method'}
                                </label>
                                <ReactSelect
                                    id="payment_method"
                                    value={
                                        data.payment_method
                                            ? {
                                                value: data.payment_method,
                                                label: paymentMethodOptions?.find(p => p.value === data.payment_method)?.label || ''
                                            }
                                            : null
                                    }
                                    onChange={(option) => {
                                        if (option && !Array.isArray(option)) {
                                            setData('payment_method', option.value);
                                        } else {
                                            setData('payment_method', '');
                                        }
                                    }}
                                    options={[
                                        { value: '', label: t('common.select_payment_method') || 'Select Payment Method' },
                                        ...paymentMethodOptions
                                    ]}
                                    placeholder={t('common.select_payment_method') || 'Select Payment Method'}
                                    className={errors?.payment_method ? 'border-red-500' : ''}
                                    error={!!errors?.payment_method}
                                    leftIcon={<CreditCardIcon className="size-4.5" />}
                                    isDisabled={!canModify}
                                />
                                {validationErrors.payment_method && <p className="text-red-500 text-sm mt-1">{validationErrors.payment_method}</p>}
                            </div>

                            <div>
                                <DatePicker
                                    value={data.payment_due_date || ''}
                                    onChange={(dates: Date[]) => {
                                        if (dates && dates.length > 0) {
                                            const date = dates[0];
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            setData('payment_due_date', `${year}-${month}-${day}`);
                                        } else {
                                            setData('payment_due_date', '');
                                        }
                                    }}
                                    placeholderText={t('common.select_payment_due_date') || 'Select Payment Due Date'}
                                    label={t('common.payment_due_date') || 'Payment Due Date'}
                                    className="rounded-xl"
                                    prefix={<CalendarIcon className="size-4.5" />}
                                    disabled={!canModify}
                                />
                                {validationErrors.payment_due_date && <p className="text-red-500 text-sm mt-1">{validationErrors.payment_due_date}</p>}
                            </div>

                            <div>
                                <DatePicker
                                    value={data.confirmed_delivery_date || ''}
                                    onChange={(dates: Date[]) => {
                                        if (dates && dates.length > 0) {
                                            const date = dates[0];
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            setData('confirmed_delivery_date', `${year}-${month}-${day}`);
                                        } else {
                                            setData('confirmed_delivery_date', '');
                                        }
                                    }}
                                    placeholderText={t('common.select_confirmed_delivery_date') || 'Select Confirmed Delivery Date'}
                                    label={t('common.confirmed_delivery_date') || 'Confirmed Delivery Date'}
                                    className="rounded-xl"
                                    prefix={<CalendarIcon className="size-4.5" />}
                                    disabled={!canModify}
                                />
                                {validationErrors.confirmed_delivery_date && <p className="text-red-500 text-sm mt-1">{validationErrors.confirmed_delivery_date}</p>}
                            </div>
                        </div>

                        {/* Products Section */}
                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    {t('common.products_breadcrumb') || 'Products'}
                                </h3>
                                {canModify && (
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        color="primary"
                                        onClick={addProduct}
                                        className="flex items-center gap-2"
                                    >
                                        <PlusIcon className="size-4" />
                                        {t('common.add_product') || 'Add Product'}
                                    </Button>
                                )}
                            </div>

                            {data.products.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    {t('common.no_products_added')}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data.products.map((product, index) => (
                                        <Card key={index} className="p-4 bg-gray-50 dark:bg-dark-600">
                                            <div className="grid grid-cols-1 md:grid-cols-7 lg:grid-cols-8 gap-4 items-end">
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                        {t('common.product') || 'Product'}
                                                        <span className="text-red-500 mx-1">*</span>
                                                    </label>
                                                    <ReactSelect
                                                        value={
                                                            product.product_id
                                                                ? {
                                                                    value: product.product_id,
                                                                    label: products.find(p => p.id === product.product_id)?.name || product.product_name || ''
                                                                }
                                                                : null
                                                        }
                                                        onChange={(option) => {
                                                            if (option && !Array.isArray(option)) {
                                                                const selectedProduct = products.find(p => p.id === option.value);
                                                                
                                                                const newProducts = [...data.products];
                                                                newProducts[index] = {
                                                                    ...newProducts[index],
                                                                    product_id: option.value,
                                                                    product_name: selectedProduct?.name || '',
                                                                };
                                                                setData('products', newProducts);
                                                            } else {
                                                                const newProducts = [...data.products];
                                                                newProducts[index] = {
                                                                    ...newProducts[index],
                                                                    product_id: '',
                                                                    product_name: '',
                                                                };
                                                                setData('products', newProducts);
                                                            }
                                                        }}
                                                        options={products.map(p => ({
                                                            value: p.id,
                                                            label: `${p.name} (${p.sku})`
                                                        }))}
                                                        placeholder={t('common.select_product') || 'Select Product'}
                                                        isDisabled={!canModify}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                        {t('common.quantity') || 'Quantity'}
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={product.quantity}
                                                        onChange={(e) => updateProduct(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                        className="rounded-xl"
                                                        disabled={!canModify}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                        {t('common.unit_price') || 'Unit Price'}
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={product.unit_price}
                                                        onChange={(e) => updateProduct(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                        className="rounded-xl"
                                                        disabled={!canModify}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                        {t('common.tva') || 'TVA %'}
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        value={product.tva}
                                                        onChange={(e) => updateProduct(index, 'tva', parseFloat(e.target.value) || 0)}
                                                        className="rounded-xl"
                                                        disabled={!canModify}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                        {t('common.reduction') || 'Reduction %'}
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        value={product.reduction_taux}
                                                        onChange={(e) => updateProduct(index, 'reduction_taux', parseFloat(e.target.value) || 0)}
                                                        className="rounded-xl"
                                                        disabled={!canModify}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                        {t('common.total') || 'Total'}
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        value={product.total_price.toFixed(2)}
                                                        disabled
                                                        className="rounded-xl bg-gray-100 dark:bg-dark-500"
                                                    />
                                                </div>

                                                {canModify && (
                                                    <div className="flex items-end">
                                                        <Button
                                                            type="button"
                                                            variant="flat"
                                                            color="error"
                                                            isIcon
                                                            onClick={() => removeProduct(index)}
                                                            className="size-10"
                                                            title={t('common.remove') || 'Remove'}
                                                        >
                                                            <TrashIcon className="size-5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* Order Summary / Recapitulative */}
                            {data.products.length > 0 && (
                                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <div className="flex justify-end">
                                        <div className="w-full max-w-md">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/20">
                                                    <CalculatorIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                    {t('common.order_summary') || 'Order Summary'}
                                                </h3>
                                            </div>
                                            <div className="space-y-3 bg-gray-50 dark:bg-dark-600 rounded-lg p-4">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {t('common.subtotal') || 'Subtotal'}:
                                                    </span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                                        {parseFloat(data.subtotal).toFixed(2)} {t('common.currency') || 'MAD'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {t('common.shipping_cost') || 'Shipping Cost'}:
                                                    </span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                                        {parseFloat(data.shipping_cost || '0').toFixed(2)} {t('common.currency') || 'MAD'}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {t('common.discount') || 'Discount'} ({data.discount_percentage}%):
                                                    </span>
                                                    <span className="font-medium text-error">
                                                        - {parseFloat(data.discount_amount).toFixed(2)} {t('common.currency') || 'MAD'}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {t('common.tax_amount') || 'Tax (TVA)'}:
                                                    </span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                                        {parseFloat(data.tax_amount).toFixed(2)} {t('common.currency') || 'MAD'}
                                                    </span>
                                                </div>

                                                <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                            {t('common.total_amount') || 'Total Amount'}:
                                                        </span>
                                                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                                            {parseFloat(data.total_amount).toFixed(2)} {t('common.currency') || 'MAD'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => router.get(route('orders.index'))}
                                disabled={processing}
                            >
                                {t('common.cancel')}
                            </Button>
                            {canModify && (
                                <Button
                                    type="submit"
                                    variant="filled"
                                    disabled={processing}
                                    color="primary"
                                >
                                    {processing ? t('common.submitting') : t('common.update_order') || 'Update Order'}
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
                </div>
                    </form>
                </div>
            </Page>
        </MainLayout>
    );
};

export default EditOrder;

