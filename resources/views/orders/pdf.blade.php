@php
    $locale = $locale ?? app()->getLocale();
    $dir = ($locale === 'ar') ? 'rtl' : 'ltr';
    $primary = '#4DB9AD';
    $primaryLight = '#E8F7F6';
    $isArabic = ($locale === 'ar');
@endphp
<!DOCTYPE html>
<html lang="{{ $locale }}" dir="{{ $dir }}">
<head>
    <meta charset="UTF-8"/>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ __('common.order_information') }} {{ $order['reference'] ?? '' }}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1f2937; line-height: 1.5; margin: 0; padding: 20px; direction: {{ $dir }}; }
        .header { border-bottom: 2px solid {{ $primary }}; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { margin: 0; font-size: 22px; color: {{ $primary }}; }
        .header .sub { margin-top: 4px; font-size: 10px; color: #6b7280; }
        .meta { display: table; width: 100%; margin-bottom: 24px; }
        .meta-row { display: table-row; }
        .meta-cell { display: table-cell; padding: 6px 12px 6px 0; vertical-align: top; width: 50%; }
        .meta-label { font-weight: 600; color: #4b5563; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .meta-value { margin-top: 2px; }
        .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
        .status-draft { background: #e5e7eb; color: #374151; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-confirmed { background: {{ $primaryLight }}; color: #0d766e; }
        .status-shipped { background: {{ $primaryLight }}; color: #0f766e; }
        .status-received { background: #d1fae5; color: #065f46; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        .status-returned { background: #e5e7eb; color: #4b5563; }
        table.products { width: 100%; border-collapse: collapse; margin: 20px 0; }
        table.products th { text-align: left; padding: 10px 8px; background: {{ $primaryLight }}; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #0f766e; border-bottom: 2px solid {{ $primary }}; }
        table.products td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
        table.products tr:nth-child(even) { background: #f9fafb; }
        .text-right { text-align: right; }
        .text-start { text-align: left; }
        html[dir="rtl"] .text-right { text-align: left; }
        html[dir="rtl"] .text-start { text-align: right; }
        .totals { margin-top: 24px; width: 320px; margin-left: auto; }
        html[dir="rtl"] .totals { margin-left: 0; margin-right: auto; }
        .totals-row { display: table; width: 100%; padding: 6px 0; }
        .totals-label { display: table-cell; color: #6b7280; }
        .totals-value { display: table-cell; text-align: right; font-weight: 500; }
        html[dir="rtl"] .totals-value { text-align: left; }
        .totals-row.grand .totals-value { font-size: 14px; font-weight: 700; color: {{ $primary }}; }
        .totals-row.grand { border-top: 2px solid {{ $primary }}; padding-top: 12px; margin-top: 8px; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid {{ $primary }}; font-size: 9px; color: #9ca3af; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ __('common.order_information') }} {{ $order['reference'] ?? '—' }}</h1>
        <div class="sub">{{ __('common.pdf_generated_on') }} {{ $generatedAt }}</div>
    </div>

    <div class="meta">
        <div class="meta-row">
            <div class="meta-cell">
                <div class="meta-label">{{ __('common.supplier') }}</div>
                <div class="meta-value">{{ $order['supplier']['name'] ?? '—' }}</div>
            </div>
            <div class="meta-cell">
                <div class="meta-label">{{ __('common.order_status') }}</div>
                <div class="meta-value">
                    @php $status = $order['status'] ?? 'draft'; @endphp
                    <span class="status-badge status-{{ $status }}">{{ __('common.' . $status) }}</span>
                </div>
            </div>
        </div>
        <div class="meta-row">
            <div class="meta-cell">
                <div class="meta-label">{{ __('common.order_type') }}</div>
                <div class="meta-value">{{ isset($order['order_type']) ? __('common.' . $order['order_type']) : '—' }}</div>
            </div>
            <div class="meta-cell">
                <div class="meta-label">{{ __('common.order_date') }}</div>
                <div class="meta-value">{{ $order['order_date'] ?? '—' }}</div>
            </div>
        </div>
        <div class="meta-row">
            <div class="meta-cell">
                <div class="meta-label">{{ __('common.payment_method') }}</div>
                <div class="meta-value">{{ isset($order['payment_method']) ? __('common.' . $order['payment_method']) : '—' }}</div>
            </div>
            <div class="meta-cell">
                <div class="meta-label">{{ __('common.payment_due_date') }}</div>
                <div class="meta-value">{{ $order['payment_due_date'] ?? '—' }}</div>
            </div>
        </div>
        <div class="meta-row">
            <div class="meta-cell">
                <div class="meta-label">{{ __('common.confirmed_delivery_date') }}</div>
                <div class="meta-value">{{ $order['confirmed_delivery_date'] ?? '—' }}</div>
            </div>
            <div class="meta-cell"></div>
        </div>
    </div>

    <table class="products">
        <thead>
            <tr>
                <th class="text-start">{{ __('common.product_name') }}</th>
                <th class="text-right">{{ __('common.quantity') }}</th>
                <th class="text-right">{{ __('common.unit_price') }}</th>
                <th class="text-right">{{ __('common.tva') }} %</th>
                <th class="text-right">{{ __('common.reduction') }} %</th>
                <th class="text-right">{{ __('common.total') }}</th>
            </tr>
        </thead>
        <tbody>
            @forelse($order['products'] ?? [] as $product)
            <tr>
                <td class="text-start">{{ $product['product_name'] ?? '—' }}</td>
                <td class="text-right">{{ $product['quantity'] ?? 0 }}</td>
                <td class="text-right">{{ number_format((float)($product['unit_price'] ?? 0), 2) }}</td>
                <td class="text-right">{{ $product['tva'] ?? 0 }}%</td>
                <td class="text-right">{{ $product['reduction_taux'] ?? 0 }}%</td>
                <td class="text-right">{{ number_format((float)($product['total_price'] ?? 0), 2) }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align: center; color: #9ca3af;">{{ __('common.pdf_no_products') }}</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">
            <span class="totals-label">{{ __('common.subtotal') }}</span>
            <span class="totals-value">{{ $order['subtotal'] ?? '0.00' }} {{ $currency }}</span>
        </div>
        <div class="totals-row">
            <span class="totals-label">{{ __('common.shipping_cost') }}</span>
            <span class="totals-value">{{ $order['shipping_cost'] ?? '0.00' }} {{ $currency }}</span>
        </div>
        <div class="totals-row">
            <span class="totals-label">{{ __('common.discount') }} ({{ $order['discount_percentage'] ?? 0 }}%)</span>
            <span class="totals-value">- {{ $order['discount_amount'] ?? '0.00' }} {{ $currency }}</span>
        </div>
        <div class="totals-row">
            <span class="totals-label">{{ __('common.tax_amount') }} ({{ __('common.tva') }})</span>
            <span class="totals-value">{{ $order['tax_amount'] ?? '0.00' }} {{ $currency }}</span>
        </div>
        <div class="totals-row grand">
            <span class="totals-label">{{ __('common.total') }}</span>
            <span class="totals-value">{{ $order['total_amount'] ?? '0.00' }} {{ $currency }}</span>
        </div>
    </div>

    <div class="footer">
        {{ __('common.order_information') }} {{ $order['reference'] ?? '' }} — {{ __('common.pdf_footer_auto') }} {{ config('app.name') }}
    </div>
</body>
</html>
