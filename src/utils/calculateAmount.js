const calculateAmount = (pricing, tiffinType, chapatiCount) => {
    const count = parseInt(chapatiCount, 10) || 0
    const defaultChapati = parseInt(pricing.defaultChapati, 10) || 0
    const hasChapatiField = defaultChapati > 0

    // Fixed per-unit price — multiply by however many were ordered (e.g. Chapati @ ₹8 each)
    // Frontend only shows the quantity input when isFixedPrice is true AND defaultChapati >= 1.
    if (pricing.isFixedPrice && hasChapatiField && count > 0) {
        return parseFloat(pricing.basePrice) * count
    }

    // No chapati/bhakari concept at all — one flat price for the whole item
    if (pricing.isFixedPrice || !hasChapatiField) {
        return parseFloat(pricing.basePrice)
    }

    // Variable pricing — base price adjusted up/down from the default count
    const diff = defaultChapati - count
    const amount = parseFloat(pricing.basePrice) - (diff * parseFloat(pricing.pricePerChapati))
    return Math.max(0, amount)
}

module.exports = calculateAmount