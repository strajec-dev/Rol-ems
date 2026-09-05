'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import { Paddle, PaddleStatus, PaddleType, PaddleCondition } from '@/lib/data'
import { Disc, Plus, Edit, Trash2, CheckCircle, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function AdminPaddleManagementPage() {
  const {
    paddles,
    paddleRentals,
    addPaddle,
    updatePaddle,
    deletePaddle,
    returnPaddleRental,
    updatePaddleRentalStatus,
  } = usePickleball()

  const [activeTab, setActiveTab] = useState<'inventory' | 'rentals' | 'maintenance'>('inventory')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingPaddle, setEditingPaddle] = useState<Paddle | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [type, setType] = useState<PaddleType>('Control')
  const [price, setPrice] = useState(150)
  const [totalQuantity, setTotalQuantity] = useState(3)
  const [condition, setCondition] = useState<PaddleCondition>('Excellent')
  const [availability, setAvailability] = useState<PaddleStatus>('Available')
  const [notes, setNotes] = useState('')

  const handleOpenAdd = () => {
    setEditingPaddle(null)
    setName('')
    setBrand('')
    setModel('')
    setType('Control')
    setPrice(150)
    setTotalQuantity(3)
    setCondition('Excellent')
    setAvailability('Available')
    setNotes('')
    setIsAddModalOpen(true)
  }

  const handleOpenEdit = (paddle: Paddle) => {
    setEditingPaddle(paddle)
    setName(paddle.name)
    setBrand(paddle.brand)
    setModel(paddle.model)
    setType(paddle.type)
    setPrice(paddle.price)
    setTotalQuantity(paddle.totalQuantity)
    setCondition(paddle.condition)
    setAvailability(paddle.availability)
    setNotes(paddle.notes || '')
    setIsAddModalOpen(true)
  }

  const handleSavePaddle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !brand.trim()) return

    if (editingPaddle) {
      updatePaddle(editingPaddle.id, {
        name,
        brand,
        model,
        type,
        price,
        totalQuantity,
        quantityAvailable: availability === 'Available' ? Math.min(totalQuantity, editingPaddle.quantityAvailable || 1) : 0,
        condition,
        availability,
        notes,
      })
    } else {
      addPaddle({
        name,
        brand,
        model,
        type,
        price,
        availability,
        quantityAvailable: availability === 'Available' ? totalQuantity : 0,
        totalQuantity,
        rentalDuration: '2 Hours / Session',
        condition,
        notes,
      })
    }

    setIsAddModalOpen(false)
  }

  const getStatusBadge = (status: PaddleStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'Rented':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'Reserved':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Unavailable':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'Under Maintenance':
        return 'bg-rose-100 text-rose-800 border-rose-300'
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pb-16">
      {/* Subheader */}
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#1E5336] hover:underline mb-2"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Inventory & Equipment</p>
              <h1 className="mt-1 font-serif text-4xl text-[#1E5336]">Admin Paddle Management</h1>
            </div>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-2 bg-[#1E5336] text-[#FDFBF7] px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#153b26] transition shadow-sm"
            >
              <Plus size={16} /> Add New Paddle
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Navigation Tabs */}
        <div className="mb-6 flex gap-2 border-b border-[#222222]/10 pb-3">
          {[
            { key: 'inventory', label: `Paddle Inventory (${paddles.length})` },
            { key: 'rentals', label: `Active Rentals (${paddleRentals.filter((r) => r.status === 'Active' || r.status === 'Reserved').length})` },
            { key: 'maintenance', label: `Under Maintenance (${paddles.filter((p) => p.availability === 'Under Maintenance' || p.availability === 'Unavailable').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                activeTab === tab.key
                  ? 'border-b-2 border-[#1E5336] text-[#1E5336]'
                  : 'text-[#6B756B] hover:text-[#1E5336]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
              <h2 className="font-serif text-2xl text-[#1E5336]">Master Paddle Catalog</h2>
              <span className="text-xs text-[#6B756B]">Update status, pricing, stock quantity & condition</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#222222]/10 bg-[#F3F0EC] text-[#6B756B] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-3">Paddle Name</th>
                    <th className="p-3">Brand / Model</th>
                    <th className="p-3">Type</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-center">Stock</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Condition</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]/10">
                  {paddles.map((paddle) => (
                    <tr key={paddle.id} className="hover:bg-amber-50/40">
                      <td className="p-3 font-bold text-[#1E5336]">
                        <div className="flex items-center gap-2">
                          <Disc size={15} className="text-[#E1A728]" />
                          <span>{paddle.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-[#222222]">{paddle.brand} ({paddle.model})</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-stone-200 text-stone-800 rounded">
                          {paddle.type}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#1E5336]">₱{paddle.price}</td>
                      <td className="p-3 text-center font-bold">
                        {paddle.quantityAvailable} / {paddle.totalQuantity}
                      </td>
                      <td className="p-3 text-center">
                        <select
                          value={paddle.availability}
                          onChange={(e) =>
                            updatePaddle(paddle.id, {
                              availability: e.target.value as PaddleStatus,
                            })
                          }
                          className={`px-2 py-1 text-[10px] font-bold uppercase border rounded cursor-pointer ${getStatusBadge(paddle.availability)}`}
                        >
                          <option value="Available">Available</option>
                          <option value="Rented">Rented</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Unavailable">Unavailable</option>
                          <option value="Under Maintenance">Under Maintenance</option>
                        </select>
                      </td>
                      <td className="p-3 text-center text-[#6B756B]">{paddle.condition}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(paddle)}
                            className="p-1.5 border border-[#222222]/20 text-[#1E5336] hover:bg-[#1E5336] hover:text-white rounded transition"
                            title="Edit Paddle"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => deletePaddle(paddle.id)}
                            className="p-1.5 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded transition"
                            title="Delete Paddle"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACTIVE RENTALS TAB */}
        {activeTab === 'rentals' && (
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
              <h2 className="font-serif text-2xl text-[#1E5336]">Current Equipment Rentals Log</h2>
              <span className="text-xs text-[#6B756B]">Track rented paddles & process returns</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#222222]/10 bg-[#F3F0EC] text-[#6B756B] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Paddle Name</th>
                    <th className="p-3">Renter Name</th>
                    <th className="p-3">Attached Session / Booking</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Rental Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]/10">
                  {paddleRentals.map((rental) => (
                    <tr key={rental.id} className="hover:bg-amber-50/40">
                      <td className="p-3 font-mono font-bold text-[#1E5336]">{rental.id}</td>
                      <td className="p-3 font-bold text-[#222222]">{rental.paddleName}</td>
                      <td className="p-3 text-[#1E5336]">
                        {rental.renterName}
                        {rental.renterContact && <span className="block text-[10px] text-[#6B756B]">{rental.renterContact}</span>}
                      </td>
                      <td className="p-3 text-[#6B756B]">
                        <span className="font-bold text-[#222222] block">{rental.attachedToType}</span>
                        {rental.courtOrSession || rental.attachedToId || 'N/A'}
                      </td>
                      <td className="p-3 text-[#222222]">{rental.duration}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase ${
                          rental.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          ₱{rental.totalPrice} ({rental.paymentMethod})
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                          rental.status === 'Active'
                            ? 'bg-blue-100 text-blue-800'
                            : rental.status === 'Returned'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-800'
                        }`}>
                          {rental.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {rental.status !== 'Returned' ? (
                          <button
                            onClick={() => returnPaddleRental(rental.id)}
                            className="bg-[#1E5336] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-[#153b26] transition rounded"
                          >
                            Mark Returned
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-bold uppercase">Returned ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MAINTENANCE & DAMAGED TAB */}
        {activeTab === 'maintenance' && (
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
              <div>
                <h2 className="font-serif text-2xl text-[#1E5336]">Damaged & Maintenance Equipment Log</h2>
                <p className="text-xs text-[#6B756B]">Paddles flagged for repair, grip replacement, or replacement</p>
              </div>
            </div>

            <div className="space-y-4">
              {paddles
                .filter((p) => p.availability === 'Under Maintenance' || p.availability === 'Unavailable')
                .map((paddle) => (
                  <div
                    key={paddle.id}
                    className="border border-rose-200 bg-rose-50/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={24} className="text-rose-600 shrink-0 mt-1" />
                      <div>
                        <h4 className="font-serif text-lg font-bold text-rose-950">{paddle.name}</h4>
                        <p className="text-xs text-rose-800">{paddle.brand} · Model: {paddle.model} · Condition: {paddle.condition}</p>
                        <p className="mt-1 text-xs text-[#555] italic">Notes: "{paddle.notes || 'Scheduled for inspection'}"</p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        updatePaddle(paddle.id, {
                          availability: 'Available',
                          quantityAvailable: paddle.totalQuantity,
                        })
                      }
                      className="bg-[#1E5336] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#153b26] transition shrink-0"
                    >
                      Restore to Available
                    </button>
                  </div>
                ))}

              {paddles.filter((p) => p.availability === 'Under Maintenance' || p.availability === 'Unavailable').length === 0 && (
                <div className="py-12 text-center text-[#6B756B]">
                  <CheckCircle size={36} className="mx-auto text-emerald-600 mb-2" />
                  <p className="text-sm font-bold">All paddles are in optimal operating condition!</p>
                  <p className="text-xs mt-1">No equipment currently flagged for maintenance.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Paddle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-[#222222]/20 bg-[#FDFBF7] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
              <h3 className="font-serif text-2xl text-[#1E5336]">
                {editingPaddle ? 'Edit Paddle Specs' : 'Add New Paddle Inventory'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#6B756B] hover:text-[#222222] font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePaddle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#6B756B] mb-1">
                    Paddle Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Selkirk Vanguard"
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#6B756B] mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Selkirk, Joola"
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#6B756B] mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. 16mm Quad"
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#6B756B] mb-1">
                    Paddle Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PaddleType)}
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  >
                    <option value="Control">Control</option>
                    <option value="Power">Power</option>
                    <option value="All-Around">All-Around</option>
                    <option value="Spin">Spin</option>
                    <option value="Precision">Precision</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#6B756B] mb-1">
                    Rental Price (₱)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#6B756B] mb-1">
                    Total Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={totalQuantity}
                    onChange={(e) => setTotalQuantity(Number(e.target.value))}
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#6B756B] mb-1">
                    Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as PaddleCondition)}
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#6B756B] mb-1">
                  Availability Status
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as PaddleStatus)}
                  className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none font-bold text-[#1E5336]"
                >
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Unavailable">Unavailable</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#6B756B] mb-1">
                  Notes / Maintenance Log
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes on grip, surface friction, or repair schedules..."
                  className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none h-20"
                />
              </div>

              <div className="pt-4 border-t border-[#222222]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="border border-[#222222]/20 px-4 py-2 font-bold uppercase text-[#6B756B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E5336] text-[#FDFBF7] px-5 py-2 font-bold uppercase tracking-wider hover:bg-[#153b26]"
                >
                  Save Paddle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
