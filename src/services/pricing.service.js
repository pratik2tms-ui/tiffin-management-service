const { Pricing, TiffinCenter } = require('../models')
const ServiceError = require('../utils/ServiceError')

const getActivePricing = async ({ centerId }) => {
    if (!centerId) {
        throw new ServiceError('VALIDATION_ERROR', 'centerId is required', 400)
    }

    const center = await TiffinCenter.findByPk(centerId)
    if (!center) {
        throw new ServiceError('NOT_FOUND', 'Tiffin center not found', 404)
    }

    const rows = await Pricing.findAll({
        where: { centerId, isActive: true, isDeleted: false, effectiveTo: null },
    })

    if (rows.length === 0) {
        throw new ServiceError('NOT_FOUND', 'No active pricing found for this center', 404)
    }

    const result = {}
    rows.forEach(row => {
        result[row.tiffinType] = {
            id: row.id,
            name: row.tiffinType.charAt(0).toUpperCase() + row.tiffinType.slice(1),
            basePrice: parseFloat(row.basePrice),
            defaultChapati: row.defaultChapati,
            pricePerChapati: parseFloat(row.pricePerChapati),
            isFixedPrice: row.isFixedPrice,
        }
    })

    return result
}

const updatePricing = async ({ centerId, prices, requester }) => {
    if (!centerId) {
        throw new ServiceError('VALIDATION_ERROR', 'centerId is required', 400)
    }
    if (!prices || typeof prices !== 'object') {
        throw new ServiceError('VALIDATION_ERROR', 'prices object is required', 400)
    }

    const center = await TiffinCenter.findByPk(centerId)
    if (!center) {
        throw new ServiceError('NOT_FOUND', 'Tiffin center not found', 404)
    }

    // Fetch valid tiffin types for this center from pricing table
    const existingPricingRows = await Pricing.findAll({
        where: { centerId, isActive: true, isDeleted: false, effectiveTo: null },
        attributes: ['tiffinType'],
        raw: true,
    })

    const validTypes = new Set(
        existingPricingRows.map(r => r.tiffinType || r.tiffin_type).filter(Boolean)
    )

    const today = new Date().toISOString().split('T')[0]
    const updatedTypes = []

    // Iterate over what the frontend sent, not a hardcoded list
    for (const type of Object.keys(prices)) {
        const incoming = prices[type]
        if (!incoming) continue

        // Skip types not configured for this center
        if (validTypes.size > 0 && !validTypes.has(type)) {
            console.warn(`[updatePricing] Skipping unknown type "${type}" for center ${centerId}`)
            continue
        }

        const existingToday = await Pricing.findOne({
            where: { centerId, tiffinType: type, effectiveFrom: today, isDeleted: false },
        })

        if (existingToday) {
            existingToday.basePrice = incoming.basePrice
            existingToday.defaultChapati = incoming.defaultChapati || 0
            existingToday.pricePerChapati = incoming.pricePerChapati ?? 5.00
            existingToday.isFixedPrice = !!incoming.isFixedPrice
            existingToday.isActive = true
            existingToday.effectiveTo = null
            existingToday.modifiedBy = requester.id
            await existingToday.save()
        } else {
            await Pricing.update(
                { effectiveTo: today, modifiedBy: requester.id },
                { where: { centerId, tiffinType: type, isActive: true, isDeleted: false, effectiveTo: null } }
            )

            await Pricing.create({
                centerId,
                tiffinType: type,
                basePrice: incoming.basePrice,
                defaultChapati: incoming.defaultChapati || 0,
                pricePerChapati: incoming.pricePerChapati ?? 5.00,
                isFixedPrice: !!incoming.isFixedPrice,
                effectiveFrom: today,
                effectiveTo: null,
                isActive: true,
                createdBy: requester.id,
            })
        }

        updatedTypes.push(type)
    }

    if (updatedTypes.length === 0) {
        throw new ServiceError('VALIDATION_ERROR', 'No valid tiffin types found in prices object', 400)
    }

    return { effectiveFrom: today, updatedTypes }
}

module.exports = { getActivePricing, updatePricing }