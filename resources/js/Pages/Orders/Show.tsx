import MainLayout from '@/layouts/MainLayout';
import React from 'react';
import { router } from '@inertiajs/react';
import { Button, Card, Badge } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { Page } from '@/components/shared/Page';
import { BreadcrumbItem, Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { 
    CalendarIcon, 
    BuildingStorefrontIcon, 
    TagIcon, 
    TruckIcon, 
    PercentBadgeIcon, 
    CreditCardIcon, 
    UserIcon,
    PencilIcon,
    ArrowLeftIcon,
    CalculatorIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { ListOrderedIcon } from 'lucide-react';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

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
  requested_by: string;
  products?: OrderProduct[];
  created_at?: string;
  approved?: boolean;
  approved_at?: string;
  received_at?: string;
  received_by?: {
    uuid: string;
    name: string;
  };
  receiving_notes?: string;
  cancellation_reason?: string;
  cancelled_by?: {
    uuid: string;
    name: string;
  };
  cancelled_at?: string;
  return_reason?: string;
  returned_at?: string;
}

interface ShowOrderProps {
  order: Order;
  error?: string;
}

const ShowOrder: React.FC<ShowOrderProps> = ({ order, error }) => {
    const { t } = useTranslation();

    if (error || !order) {
        return (
            <MainLayout>
                <Page title={t("common.order_details") || "Order Details"}>
                    <div className="transition-content px-(--margin-x) pb-6">
                        <div className="text-center py-8">
                            <p className="text-red-500">{error || t('common.order_not_found')}</p>
                            <Button
                                onClick={() => router.visit(route('orders.index'))}
                                className="mt-4"
                            >
                                {t('common.back_to_orders')}
                            </Button>
                        </div>
                    </div>
                </Page>
            </MainLayout>
        );
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('common.orders') || 'Orders', path: route('orders.index') },
        { title: order.reference || t('common.order_details')},
    ];

    const getStatusBadgeColor = (status: string) => {
        const mapping: Record<string, string> = {
            'draft': 'secondary',
            'pending': 'warning',
            'confirmed': 'info',
            'shipped': 'primary',
            'received': 'success',
            'cancelled': 'danger',
            'returned': 'secondary',
        };
        return mapping[status] || 'secondary';
    };

    const canModify = order.status === 'draft' || order.status === 'pending';

    return (
       <MainLayout>
             <Page title={t("common.order_details") || "Order Details"}>
               <div className="transition-content px-(--margin-x) pb-6">
                 <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
                   <div className="flex items-center gap-1">
                     <div>
                       <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
                       <p className="text-sm text-gray-500 dark:text-gray-400">
                         {t('common.view_order_details') || 'View order information'}
                       </p>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <Button
                        variant="outlined"
                        onClick={() => router.visit(route('orders.index'))}
                        className="flex items-center gap-2"
                     >
                        <ArrowLeftIcon className="size-4" />
                        {t('common.back')}
                     </Button>
                     {canModify && (
                        <Button
                            variant="filled"
                            color="primary"
                            onClick={() => router.visit(route('orders.edit', order.uuid))}
                            className="flex items-center gap-2"
                        >
                            <PencilIcon className="size-4" />
                            {t('common.edit')}
                        </Button>
                     )}
                   </div>
                 </div>

                 <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
                    {/* Main Order Information */}
                    <div className="col-span-12 lg:col-span-8">
                        <Card className="p-4 sm:px-5">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                    {t('common.order_information') || 'Order Information'}
                                </h2>
                                <Badge color={getStatusBadgeColor(order.status)}>
                                    {t(`common.${order.status}`) || order.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <TagIcon className="size-4" />
                                            {t('common.reference') || 'Reference'}
                                        </label>
                                        <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                                            {order.reference}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <BuildingStorefrontIcon className="size-4" />
                                            {t('common.supplier') || 'Supplier'}
                                        </label>
                                        <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                                            {order.supplier?.name || '-'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <ListOrderedIcon className="size-4" />
                                            {t('common.order_type') || 'Order Type'}
                                        </label>
                                        <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1 capitalize">
                                            {t(`common.${order.order_type}`) || order.order_type}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <CalendarIcon className="size-4" />
                                            {t('common.order_date') || 'Order Date'}
                                        </label>
                                        <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                                            {order.order_date || '-'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <CreditCardIcon className="size-4" />
                                            {t('common.payment_method') || 'Payment Method'}
                                        </label>
                                        <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1 capitalize">
                                            {t(`common.${order.payment_method}`) || order.payment_method}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <CalendarIcon className="size-4" />
                                            {t('common.payment_due_date') || 'Payment Due Date'}
                                        </label>
                                        <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                                            {order.payment_due_date || '-'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <TruckIcon className="size-4" />
                                            {t('common.confirmed_delivery_date') || 'Delivery Date'}
                                        </label>
                                        <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                                            {order.confirmed_delivery_date || '-'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <TruckIcon className="size-4" />
                                            {t('common.shipping_cost') || 'Shipping Cost'}
                                        </label>
                                        <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                                            {order.shipping_cost} {t('common.currency') || 'MAD'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information based on status */}
                            {order.cancelled_at && (
                                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                                        {t('common.cancellation_information') || 'Cancellation Information'}
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <p className="text-red-700 dark:text-red-300">
                                            <span className="font-medium">{t('common.cancelled_at')}: </span>
                                            {order.cancelled_at}
                                        </p>
                                        {order.cancelled_by && (
                                            <p className="text-red-700 dark:text-red-300">
                                                <span className="font-medium">{t('common.cancelled_by')}: </span>
                                                {order.cancelled_by.name}
                                            </p>
                                        )}
                                        {order.cancellation_reason && (
                                            <p className="text-red-700 dark:text-red-300">
                                                <span className="font-medium">{t('common.reason')}: </span>
                                                {order.cancellation_reason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {order.received_at && (
                                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                                        {t('common.receiving_information') || 'Receiving Information'}
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <p className="text-green-700 dark:text-green-300">
                                            <span className="font-medium">{t('common.received_at')}: </span>
                                            {order.received_at}
                                        </p>
                                        {order.received_by && (
                                            <p className="text-green-700 dark:text-green-300">
                                                <span className="font-medium">{t('common.received_by')}: </span>
                                                {order.received_by.name}
                                            </p>
                                        )}
                                        {order.receiving_notes && (
                                            <p className="text-green-700 dark:text-green-300">
                                                <span className="font-medium">{t('common.notes')}: </span>
                                                {order.receiving_notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Products Section */}
                        {order.products && order.products.length > 0 && (
                            <Card className="p-4 sm:px-5 mt-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <ShoppingCartIcon className="size-5 text-primary-600 dark:text-primary-400" />
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                        {t('common.products') || 'Products'}
                                    </h2>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-dark-600">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {t('common.product') || 'Product'}
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {t('common.quantity') || 'Quantity'}
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {t('common.unit_price') || 'Unit Price'}
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {t('common.tva') || 'TVA %'}
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {t('common.reduction') || 'Reduction %'}
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {t('common.total') || 'Total'}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {order.products.map((product, index) => (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-600">
                                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                                        {product.product_name || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 text-right">
                                                        {product.quantity}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 text-right">
                                                        {product.unit_price.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 text-right">
                                                        {product.tva}%
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 text-right">
                                                        {product.reduction_taux}%
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 text-right">
                                                        {product.total_price.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="col-span-12 lg:col-span-4">
                        <Card className="p-4 sm:px-5">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/20">
                                    <CalculatorIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    {t('common.order_summary') || 'Order Summary'}
                                </h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('common.subtotal') || 'Subtotal'}
                                    </span>
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {order.subtotal} {t('common.currency') || 'MAD'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('common.shipping_cost') || 'Shipping'}
                                    </span>
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {order.shipping_cost} {t('common.currency') || 'MAD'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('common.discount') || 'Discount'} ({order.discount_percentage}%)
                                    </span>
                                    <span className="text-sm font-medium text-error">
                                        - {order.discount_amount} {t('common.currency') || 'MAD'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('common.tax_amount') || 'Tax (TVA)'}
                                    </span>
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {order.tax_amount} {t('common.currency') || 'MAD'}
                                    </span>
                                </div>

                                <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
                                            {t('common.total_amount') || 'Total'}
                                        </span>
                                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                            {order.total_amount} {t('common.currency') || 'MAD'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Order Timeline/Status */}
                        <Card className="p-4 sm:px-5 mt-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                {t('common.order_status') || 'Order Status'}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 mt-1.5"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {t('common.current_status') || 'Current Status'}
                                        </p>
                                        <Badge color={getStatusBadgeColor(order.status)} className="mt-1">
                                            {t(`common.${order.status}`) || order.status}
                                        </Badge>
                                    </div>
                                </div>

                                {order.created_at && (
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-success mt-1.5"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                {t('common.created') || 'Created'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                 </div>
               </div>
            </Page>
        </MainLayout>
    );
};

export default ShowOrder;

