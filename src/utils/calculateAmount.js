const calculateAmount = (pricing, tiffinType, chapatiCount) => {
    const hasChapatiField = pricing.defaultChapati !== null && pricing.defaultChapati !== undefined
        && pricing.defaultChapati !== 0

    // No chapati/bhakari concept at all — one flat price for the whole item (e.g. Dal Rice)
    if (tiffinType === 'dalrice' || !hasChapatiField) {
        return parseFloat(pricing.basePrice)
    }

    // Fixed per-unit price — multiply by however many were ordered (e.g. Chapati @ ₹8 each)
    if (pricing.isFixedPrice) {
        return parseFloat(pricing.basePrice) * chapatiCount
    }

    // Variable pricing — base price adjusted up/down from the default count
    const diff = pricing.defaultChapati - chapatiCount
    const amount = parseFloat(pricing.basePrice) - (diff * parseFloat(pricing.pricePerChapati))
    return Math.max(0, amount)
}

module.exports = calculateAmount