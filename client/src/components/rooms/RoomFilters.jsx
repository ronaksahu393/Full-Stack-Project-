import React, { useState } from "react";
import { Search, SlidersHorizontal, RotateCcw, X, Check } from "lucide-react";

export default function RoomFilters({
  search,
  setSearch,
  category,
  setCategory,
  maxPrice,
  setMaxPrice,
  guests,
  setGuests,
  sort,
  setSort,
  selectedAmenity,
  setSelectedAmenity,
  categories = [],
  amenitiesList = [],
  onReset
}) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const filterContent = (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="space-y-2">
        <label className="block text-[11px] uppercase tracking-wider text-[#C4A46B] font-semibold">
          Suite Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1.5 transition-all border ${
                  isSelected
                    ? "bg-[#173F35] text-white border-[#173F35] font-medium shadow-sm"
                    : "bg-white text-[#252923]/80 border-[#E7E3D9] hover:border-[#173F35]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-[#252923]">
          <label className="uppercase tracking-wider text-[11px] text-[#C4A46B] font-semibold">
            Max Nightly Rate
          </label>
          <span className="font-semibold text-[#173F35]">${maxPrice}</span>
        </div>
        <input
          type="range"
          min="200"
          max="1200"
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#173F35] cursor-pointer"
          aria-label="Max price per night"
        />
        <div className="flex justify-between text-[10px] text-[#72776F]">
          <span>$200</span>
          <span>$1,200+</span>
        </div>
      </div>

      {/* Guest Capacity */}
      <div className="space-y-2">
        <label className="block text-[11px] uppercase tracking-wider text-[#C4A46B] font-semibold">
          Guest Capacity
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="w-full py-2.5 px-3 bg-[#F8F6F0] border border-[#E7E3D9] text-xs text-[#252923] outline-none"
        >
          <option value="">Any Capacity</option>
          <option value="1">1+ Guest</option>
          <option value="2">2+ Guests</option>
          <option value="3">3+ Guests</option>
          <option value="4">4+ Guests</option>
        </select>
      </div>

      {/* Selected Amenity Filter */}
      {amenitiesList && amenitiesList.length > 0 && (
        <div className="space-y-2">
          <label className="block text-[11px] uppercase tracking-wider text-[#C4A46B] font-semibold">
            Signature Amenity
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedAmenity("")}
              className={`text-[11px] px-2.5 py-1 border transition-all ${
                !selectedAmenity
                  ? "bg-[#173F35] text-white border-[#173F35]"
                  : "bg-white text-[#72776F] border-[#E7E3D9] hover:border-[#173F35]"
              }`}
            >
              All Amenities
            </button>
            {amenitiesList.map((amenity) => {
              const active = selectedAmenity === amenity;
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => setSelectedAmenity(active ? "" : amenity)}
                  className={`text-[11px] px-2.5 py-1 border transition-all ${
                    active
                      ? "bg-[#173F35] text-white border-[#173F35]"
                      : "bg-white text-[#252923]/80 border-[#E7E3D9] hover:border-[#173F35]"
                  }`}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset Action */}
      <div className="pt-2 border-t border-[#E7E3D9]">
        <button
          type="button"
          onClick={onReset}
          className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-[#72776F] hover:text-[#173F35] transition-colors py-2 border border-[#E7E3D9] bg-white hover:bg-[#F8F6F0]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Top Search & Filter Bar */}
      <div className="bg-white border border-[#E7E3D9] p-4 sm:p-5 shadow-subtle mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          {/* Search Input */}
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-[#C4A46B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by suite, sanctuary, or regional setting..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F0] border border-[#E7E3D9] focus:border-[#173F35] text-xs sm:text-sm text-[#252923] placeholder-[#72776F]/60 outline-none transition-colors"
              aria-label="Search suites"
            />
          </div>

          {/* Sorting */}
          <div className="md:col-span-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full py-2.5 px-3 bg-[#F8F6F0] border border-[#E7E3D9] text-xs text-[#252923] outline-none cursor-pointer"
              aria-label="Sort suites"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Rate: Low to High</option>
              <option value="price-desc">Rate: High to Low</option>
              <option value="rating">Highest Guest Rating</option>
            </select>
          </div>

          {/* Mobile Filter Drawer Trigger & Desktop Reset */}
          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#F8F6F0] border border-[#E7E3D9] text-xs font-medium text-[#173F35]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C4A46B]" />
              <span>Filters</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="hidden lg:inline-flex items-center gap-1 text-xs text-[#72776F] hover:text-[#173F35] py-2 px-3 border border-[#E7E3D9] hover:bg-[#F8F6F0] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar Container (Used in ExploreStaysPage) or Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm lg:hidden">
          <div className="bg-white w-full max-w-sm h-full p-6 shadow-elevated overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E3D9]">
              <h3 className="font-serif text-lg text-[#173F35]">Filter Residences</h3>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 text-[#72776F] hover:text-[#173F35]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterContent}
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="w-full btn-primary py-3 text-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function DesktopFilterSidebar({
  category,
  setCategory,
  maxPrice,
  setMaxPrice,
  guests,
  setGuests,
  selectedAmenity,
  setSelectedAmenity,
  categories = [],
  amenitiesList = [],
  onReset
}) {
  return (
    <aside className="hidden lg:block bg-white border border-[#E7E3D9] p-6 shadow-subtle space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#E7E3D9]">
        <h3 className="font-serif text-lg text-[#173F35]">Refine Stays</h3>
        <button
          onClick={onReset}
          className="text-[11px] text-[#72776F] hover:text-[#173F35] uppercase tracking-wider font-medium"
        >
          Reset
        </button>
      </div>

      {/* Category Selection */}
      <div className="space-y-2">
        <label className="block text-[11px] uppercase tracking-wider text-[#C4A46B] font-semibold">
          Category
        </label>
        <div className="flex flex-col space-y-1">
          {categories.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-left text-xs px-2.5 py-1.5 transition-colors flex items-center justify-between ${
                  isSelected
                    ? "bg-[#173F35] text-white font-medium"
                    : "text-[#252923]/80 hover:bg-[#F8F6F0]"
                }`}
              >
                <span>{cat}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#C4A46B]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Price Slider */}
      <div className="space-y-2 pt-2 border-t border-[#E7E3D9]">
        <div className="flex justify-between text-xs text-[#252923]">
          <label className="uppercase tracking-wider text-[11px] text-[#C4A46B] font-semibold">
            Max Rate / Night
          </label>
          <span className="font-semibold text-[#173F35]">${maxPrice}</span>
        </div>
        <input
          type="range"
          min="200"
          max="1200"
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#173F35] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#72776F]">
          <span>$200</span>
          <span>$1,200</span>
        </div>
      </div>

      {/* Guest Capacity */}
      <div className="space-y-2 pt-2 border-t border-[#E7E3D9]">
        <label className="block text-[11px] uppercase tracking-wider text-[#C4A46B] font-semibold">
          Guest Capacity
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="w-full py-2 px-3 bg-[#F8F6F0] border border-[#E7E3D9] text-xs text-[#252923] outline-none"
        >
          <option value="">Any Capacity</option>
          <option value="1">1+ Guest</option>
          <option value="2">2+ Guests</option>
          <option value="3">3+ Guests</option>
          <option value="4">4+ Guests</option>
        </select>
      </div>

      {/* Signature Amenities */}
      {amenitiesList && amenitiesList.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#E7E3D9]">
          <label className="block text-[11px] uppercase tracking-wider text-[#C4A46B] font-semibold">
            Signature Amenities
          </label>
          <div className="flex flex-wrap gap-1.5">
            {amenitiesList.map((amenity) => {
              const active = selectedAmenity === amenity;
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => setSelectedAmenity(active ? "" : amenity)}
                  className={`text-[10px] px-2 py-1 border transition-all ${
                    active
                      ? "bg-[#173F35] text-white border-[#173F35]"
                      : "bg-[#F8F6F0] text-[#252923] border-[#E7E3D9] hover:border-[#173F35]"
                  }`}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
