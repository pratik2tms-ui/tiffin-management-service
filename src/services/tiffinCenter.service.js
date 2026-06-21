const bcrypt = require('bcryptjs')
const { TiffinCenter, User, TiffinEntry, Pricing } = require('../models')
const ServiceError = require('../utils/ServiceError')
const { Op } = require('sequelize')

const TIFFIN_TYPES = ['full', 'half', 'chapati', 'bhakari', 'dalrice']

// ── List all centers with aggregate stats ──
const listCenters = async () => {
    const centers = await TiffinCenter.findAll({
        where: { isDeleted: false },
        order: [['name', 'ASC']],
    })

    const result = []
    for (const center of centers) {
        const customerCount = await User.count({
            where: { centerId: center.id, role: 'user', isDeleted: false },
        })

        const approvedEntries = await TiffinEntry.findAll({
            where: { centerId: center.id, status: 'approved', isNoTiffin: false, isDeleted: false },
        })

        const tiffinCount = approvedEntries.length
        const totalAmount = approvedEntries.reduce((s, e) => s + parseFloat(e.amount), 0)

        result.push({
            id: center.id,
            uuid: center.uuid,
            name: center.name,
            username: center.username,
            phone: center.phone,
            address: center.address,
            avatar: center.avatar,
            status: center.status,
            customerCount,
            tiffinCount,
            totalAmount,
        })
    }

    return result
}

// ── Get single center detail ──
const getCenterById = async (id) => {
    const center = await TiffinCenter.findOne({ where: { id, isDeleted: false } })
    if (!center) {
        throw new ServiceError('NOT_FOUND', 'Tiffin center not found', 404)
    }
    return {
        id: center.id,
        uuid: center.uuid,
        name: center.name,
        username: center.username,
        phone: center.phone,
        address: center.address,
        avatar: center.avatar,
        status: center.status,
    }
}

// ── Get customers belonging to a center, with stats ──
const getCenterCustomers = async (centerId) => {
    const center = await TiffinCenter.findOne({ where: { id: centerId, isDeleted: false } })
    if (!center) {
        throw new ServiceError('NOT_FOUND', 'Tiffin center not found', 404)
    }

    const customers = await User.findAll({
        where: { centerId, role: 'user', isDeleted: false },
        attributes: ['id', 'name', 'username', 'avatar'],
        order: [['name', 'ASC']],
    })

    const result = []
    for (const customer of customers) {
        const entries = await TiffinEntry.findAll({
            where: { userId: customer.id, centerId, isDeleted: false },
        })

        const approved = entries.filter(e => e.status === 'approved' && !e.isNoTiffin)
        const total = approved.reduce((s, e) => s + parseFloat(e.amount), 0)

        const typeCounts = {}
        approved.forEach(e => {
            typeCounts[e.tiffinType] = (typeCounts[e.tiffinType] || 0) + 1
        })
        const favouriteType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

        result.push({
            id: customer.id,
            name: customer.name,
            username: customer.username,
            avatar: customer.avatar,
            approvedCount: approved.length,
            total,
            favouriteType,
        })
    }

    return result
}

// ── Create a new tiffin center (admin only, multi-center support) ──
const createCenter = async ({ name, username, ownerUsername, ownerPassword, phone, address, requester }) => {
    if (!name || !username || !ownerUsername || !ownerPassword) {
        throw new ServiceError('VALIDATION_ERROR', 'name, username, ownerUsername, ownerPassword are required', 400)
    }

    const existingCenterUsername = await TiffinCenter.findOne({ where: { username } })
    if (existingCenterUsername) {
        throw new ServiceError('CONFLICT', 'Center username already taken', 409)
    }

    const existingOwnerUsername = await User.findOne({ where: { username: ownerUsername } })
    if (existingOwnerUsername) {
        throw new ServiceError('CONFLICT', 'Owner username already taken', 409)
    }

    const passwordHash = await bcrypt.hash(ownerPassword, 10)
    const avatar = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

    // Create owner user first (role: center)
    const owner = await User.create({
        name,
        username: ownerUsername,
        passwordHash,
        role: 'center',
        phone: phone || null,
        avatar,
        createdBy: requester.id,
    })

    // Create the center, linked to owner
    const center = await TiffinCenter.create({
        ownerId: owner.id,
        name,
        username,
        phone: phone || null,
        address: address || null,
        avatar,
        status: 'active',
        createdBy: requester.id,
    })

    // Link owner back to center
    owner.centerId = center.id
    await owner.save()

    // Seed default pricing for the new center
    const today = new Date().toISOString().split('T')[0]
    const defaultPricing = {
        full: { basePrice: 80, defaultChapati: 3 },
        half: { basePrice: 60, defaultChapati: 2 },
        chapati: { basePrice: 40, defaultChapati: 2 },
        bhakari: { basePrice: 50, defaultChapati: 2 },
        dalrice: { basePrice: 70, isFixedPrice: true },
    }
    for (const type of TIFFIN_TYPES) {
        const p = defaultPricing[type]
        await Pricing.create({
            centerId: center.id,
            tiffinType: type,
            basePrice: p.basePrice,
            defaultChapati: p.defaultChapati || 0,
            pricePerChapati: 5.00,
            isFixedPrice: !!p.isFixedPrice,
            effectiveFrom: today,
            isActive: true,
            createdBy: requester.id,
        })
    }

    return {
        id: center.id,
        name: center.name,
        username: center.username,
        ownerId: owner.id,
    }
}

// ── Update center status / details ──
const updateCenter = async ({ id, status, name, phone, address, requester }) => {
    const center = await TiffinCenter.findOne({ where: { id, isDeleted: false } })
    if (!center) {
        throw new ServiceError('NOT_FOUND', 'Tiffin center not found', 404)
    }

    if (status !== undefined) center.status = status
    if (name !== undefined) center.name = name
    if (phone !== undefined) center.phone = phone
    if (address !== undefined) center.address = address
    center.modifiedBy = requester.id

    await center.save()

    return {
        id: center.id,
        name: center.name,
        status: center.status,
        phone: center.phone,
        address: center.address,
    }
}

module.exports = { listCenters, getCenterById, getCenterCustomers, createCenter, updateCenter }