import { Popover, Transition, Listbox } from "@headlessui/react";
import { Fragment, useState } from "react";
import { MapPinIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { MOCK_PROVINCES, MOCK_DISTRICTS } from "../../../mocks/locations";

const LocationSelector = ({ onLocationChange }) => {
    const [provinces] = useState(MOCK_PROVINCES);
    const [districts, setDistricts] = useState(MOCK_DISTRICTS[1] || []);
    const [selectedProvince, setSelectedProvince] = useState(MOCK_PROVINCES[0]);
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    const handleProvinceChange = (province) => {
        setSelectedProvince(province);
        setDistricts(MOCK_DISTRICTS[province.code] || []);
        setSelectedDistrict(null);
        onLocationChange?.({ province, district: null });
    };

    const handleDistrictChange = (district) => {
        setSelectedDistrict(district);
        onLocationChange?.({ province: selectedProvince, district });
    };

    const getDisplayText = () => {
        if (selectedDistrict && selectedProvince)
            return `${selectedDistrict.name}, ${selectedProvince.name}`;
        return selectedProvince?.name || "Chọn địa chỉ";
    };

    return (
        <Popover className="relative hidden md:block">
            <Popover.Button className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors">
                <MapPinIcon className="w-5 h-5 text-red-500" />
                <span className="text-sm text-gray-700 max-w-[150px] truncate">
                    {getDisplayText()}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            </Popover.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Popover.Panel className="absolute left-0 mt-2 w-80 origin-top-left bg-white rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 p-4">
                    {/* --- Nội dung giữ nguyên như bạn có --- */}
                    {/* Province Select */}
                    <div className="mb-3">
                        <label className="block text-xs text-gray-600 mb-1.5">
                            Tỉnh/Thành phố
                        </label>
                        <Listbox value={selectedProvince} onChange={handleProvinceChange}>
                            <div className="relative">
                                <Listbox.Button className="relative w-full cursor-pointer rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-left text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                                    <span className="block truncate">
                                        {selectedProvince?.name || "Chọn tỉnh/thành"}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                    </span>
                                </Listbox.Button>
                                <Transition as={Fragment}>
                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        {provinces.map((p) => (
                                            <Listbox.Option
                                                key={p.code}
                                                value={p}
                                                className={({ active }) =>
                                                    `cursor-pointer select-none py-2 px-3 ${active ? "bg-gray-100" : ""
                                                    }`
                                                }
                                            >
                                                {p.name}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                    </div>

                    {/* District Select */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1.5">
                            Quận/Huyện
                        </label>
                        <Listbox
                            value={selectedDistrict}
                            onChange={handleDistrictChange}
                            disabled={!selectedProvince || districts.length === 0}
                        >
                            <div className="relative">
                                <Listbox.Button className="relative w-full cursor-pointer rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-left text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed">
                                    <span className="block truncate">
                                        {selectedDistrict?.name || "Chọn quận/huyện"}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                    </span>
                                </Listbox.Button>
                                <Transition as={Fragment}>
                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        {districts.map((d) => (
                                            <Listbox.Option
                                                key={d.code}
                                                value={d}
                                                className={({ active }) =>
                                                    `cursor-pointer select-none py-2 px-3 ${active ? "bg-gray-100" : ""
                                                    }`
                                                }
                                            >
                                                {d.name}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    );
};

export default LocationSelector;
