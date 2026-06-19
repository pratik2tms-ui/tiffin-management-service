const calculateAmount = (pricing, tiffinType, chapatiCount) => {
    if (tiffinType === 'dalrice' || pricing.isFixedPrice) {
        return parseFloat(pricing.basePrice)
    }
    const diff = pricing.defaultChapati - chapatiCount
    const amount = parseFloat(pricing.basePrice) - (diff * parseFloat(pricing.pricePerChapati))
    return Math.max(0, amount)
}

module.exports = calculateAmount