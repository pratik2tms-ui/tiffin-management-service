const { Pricing, TiffinCenter, sequelize } = require('../models')
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
            availableDays: row.availableDays,
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

    // Iterate over what the frontend sent
    for (const type of Object.keys(prices)) {
        const incoming = prices[type]
        if (!incoming) continue

        const existingToday = await Pricing.findOne({
            where: { centerId, tiffinType: type, effectiveFrom: today, isDeleted: false },
        })

        if (existingToday) {
            existingToday.basePrice = incoming.basePrice
            existingToday.defaultChapati = incoming.defaultChapati || 0
            existingToday.pricePerChapati = incoming.pricePerChapati ?? 5.00
            existingToday.isFixedPrice = !!incoming.isFixedPrice
            if (incoming.availableDays) existingToday.availableDays = incoming.availableDays
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
                availableDays: incoming.availableDays || { "0": true, "1": true, "2": true, "3": true, "4": true, "5": true, "6": true },
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

const listPricing = async ({ centerId }) => {
    if (!centerId) throw new ServiceError('VALIDATION_ERROR', 'centerId is required', 400)
    const rows = await Pricing.findAll({
        where: { centerId, isActive: true, isDeleted: false, effectiveTo: null },
    })
    return { rows }
}

const createPricing = async ({ centerId, tiffinType, basePrice, defaultChapati, pricePerChapati, isFixedPrice, availableDays, requester }) => {
    const today = new Date().toISOString().split('T')[0]
    const existing = await Pricing.findOne({
        where: { centerId, tiffinType, isActive: true, isDeleted: false, effectiveTo: null }
    })
    if (existing) throw new ServiceError('CONFLICT', 'Active pricing for this tiffin type already exists', 409)

    const entry = await Pricing.create({
        centerId,
        tiffinType,
        basePrice,
        defaultChapati: defaultChapati || 0,
        pricePerChapati: pricePerChapati ?? 5.00,
        isFixedPrice: !!isFixedPrice,
        availableDays: availableDays || { "0": true, "1": true, "2": true, "3": true, "4": true, "5": true, "6": true },
        effectiveFrom: today,
        effectiveTo: null,
        isActive: true,
        createdBy: requester.id,
    })
    return entry
}

const updatePricingById = async (id, { tiffinType, basePrice, defaultChapati, pricePerChapati, isFixedPrice, availableDays, requester }) => {
    const today = new Date().toISOString().split('T')[0]
    const entry = await Pricing.findByPk(id)
    if (!entry) throw new ServiceError('NOT_FOUND', 'Pricing not found', 404)
    
    const finalTiffinType = tiffinType || entry.tiffinType
    if (finalTiffinType !== entry.tiffinType || entry.effectiveFrom !== today) {
        const existing = await Pricing.findOne({
            where: { centerId: entry.centerId, tiffinType: finalTiffinType, effectiveFrom: today, isDeleted: false }
        })
        if (existing && existing.id !== entry.id) {
            throw new ServiceError('CONFLICT', `Pricing for ${finalTiffinType} starting today already exists`, 409)
        }
    }

    if (entry.effectiveFrom === today) {
        await entry.update({
            tiffinType: finalTiffinType,
            basePrice: basePrice !== undefined ? basePrice : entry.basePrice,
            defaultChapati: defaultChapati !== undefined ? defaultChapati : entry.defaultChapati,
            pricePerChapati: pricePerChapati !== undefined ? pricePerChapati : entry.pricePerChapati,
            isFixedPrice: isFixedPrice !== undefined ? !!isFixedPrice : entry.isFixedPrice,
            availableDays: availableDays || entry.availableDays,
            effectiveTo: null,
            isActive: true,
            modifiedBy: requester.id
        })
        return entry
    }

    if (entry.effectiveTo) throw new ServiceError('VALIDATION_ERROR', 'Cannot update inactive pricing', 400)

    const result = await sequelize.transaction(async (t) => {
        await entry.update({ effectiveTo: today, modifiedBy: requester.id }, { transaction: t })

        const newEntry = await Pricing.create({
            centerId: entry.centerId,
            tiffinType: finalTiffinType,
            basePrice: basePrice !== undefined ? basePrice : entry.basePrice,
            defaultChapati: defaultChapati !== undefined ? defaultChapati : entry.defaultChapati,
            pricePerChapati: pricePerChapati !== undefined ? pricePerChapati : entry.pricePerChapati,
            isFixedPrice: isFixedPrice !== undefined ? !!isFixedPrice : entry.isFixedPrice,
            availableDays: availableDays || entry.availableDays,
            effectiveFrom: today,
            effectiveTo: null,
            isActive: true,
            createdBy: requester.id,
        }, { transaction: t })
        return newEntry
    })
    
    return result
}

const deletePricing = async (id, requester) => {
    const today = new Date().toISOString().split('T')[0]
    const entry = await Pricing.findByPk(id)
    if (!entry) throw new ServiceError('NOT_FOUND', 'Pricing not found', 404)
    
    await entry.update({ effectiveTo: today, isActive: false, isDeleted: true, modifiedBy: requester.id })
    return { success: true }
}

const getPricingById = async (id) => {
    const entry = await Pricing.findByPk(id)
    if (!entry) throw new ServiceError('NOT_FOUND', 'Pricing not found', 404)
    return entry
}

module.exports = { getActivePricing, updatePricing, listPricing, createPricing, updatePricingById, deletePricing, getPricingById }