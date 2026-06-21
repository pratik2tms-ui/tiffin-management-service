const { Pricing, TiffinCenter } = require('../models')
const ServiceError = require('../utils/ServiceError')

const TIFFIN_TYPES = ['full', 'half', 'chapati', 'bhakari', 'dalrice']

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

    // Reshape into { full: {...}, half: {...}, ... } to match frontend mock shape
    const result = {}
    rows.forEach(row => {
        result[row.tiffinType] = {
            id: row.id,
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

    const today = new Date().toISOString().split('T')[0]
    const updatedTypes = []

    for (const type of TIFFIN_TYPES) {
        const incoming = prices[type]
        if (!incoming) continue

        // Check if a row for this exact (center, type, today) already exists
        const existingToday = await Pricing.findOne({
            where: { centerId, tiffinType: type, effectiveFrom: today, isDeleted: false },
        })

        if (existingToday) {
            // Same-day update — overwrite the row instead of inserting a duplicate
            existingToday.basePrice = incoming.basePrice
            existingToday.defaultChapati = incoming.defaultChapati || 0
            existingToday.pricePerChapati = incoming.pricePerChapati ?? 5.00
            existingToday.isFixedPrice = type === 'dalrice' ? true : !!incoming.isFixedPrice
            existingToday.isActive = true
            existingToday.effectiveTo = null
            existingToday.modifiedBy = requester.id
            await existingToday.save()
        } else {
            // First update today — close yesterday's (or earlier) active row, insert new one
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
                isFixedPrice: type === 'dalrice' ? true : !!incoming.isFixedPrice,
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