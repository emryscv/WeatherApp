"use client";

import React from "react";
import { MdWbSunny } from "react-icons/md";
import { MdMyLocation } from "react-icons/md";
import { MdOutlineLocationOn } from "react-icons/md";
import SearchBox from "./SearchBox";
import { useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { loadingCityAtom, placeAtom } from "@/app/atom";

type Props = { location: string };

export default function Navbar({ location }: Props) {
    const [city, setCity] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [suggestion, setSuggestion] = useState<string[]>([]);
    const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
    const [place, setPlace] = useAtom(placeAtom);
    const [loadingCity, setLoadingCity] = useAtom(loadingCityAtom);

    async function handleInputChange(value: string) {
        //TODO
        setCity(value);
        if (value.length >= 3) {
            try {
                const response = await axios.get(
                    `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
                );
                const suggestion = response.data.list.map(
                    (item: any) => item.name
                );
                setSuggestion(suggestion);
                setError("");
                setShowSuggestion(true);
            } catch (error) {
                setSuggestion([]);
                setShowSuggestion(false);
            }
        } else {
            setSuggestion([]);
            setShowSuggestion(false);
        }
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        setLoadingCity(true);
        e.preventDefault();
        if (suggestion.length == 0) {
            setError("Location not found");
            setTimeout(() => setError(""), 3000);
            setLoadingCity(false);
        } else {
            setError("");
            setTimeout(() => {
                setLoadingCity(false);
                setPlace(city);
                setShowSuggestion(false);
            }, 500);
        }
    }

    function handleCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    setLoadingCity(true);
                    const response = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
                    );
                    setTimeout(() => {
                        setLoadingCity(false);
                        setPlace(response.data.name);
                    }, 500);
                } catch (error) {
                    setLoadingCity(false);
                }
            });
        }
    }

    return (
        <>
            <nav className="shadow-sm sticky top-0 left-0 z-50 bg-white">
                <div className="h-[80px] w-full flex justify-between items-center max-w-7xl px-3 mx-auto">
                    <h2 className="flex items-center justify-center gap-7">
                        <p className="text-gray-500 text-3xl">Weather</p>
                        <MdWbSunny className="text-3xl mt-1 text-yellow-300" />
                    </h2>
                    {/* */}
                    <section className="flex gap-2 items-center">
                        <MdMyLocation
                            onClick={handleCurrentLocation}
                            title="Your Current Location"
                            className="text-2xl text-gray-400 hover:opacity-80 cursor-pointer"
                        />
                        <MdOutlineLocationOn className="text-3xl" />
                        <p className="text-slate-900/80 text-sm">
                            {" "}
                            {location}{" "}
                        </p>
                        <div className="relative  hidden md:flex">
                            <SearchBox
                                value={city}
                                onChange={(e) =>
                                    handleInputChange(e.target.value)
                                }
                                onSubmit={handleSubmit}
                            />
                            <SuggestionBox
                                {...{ showSuggestion, suggestion, error }}
                                handleSuggestionClick={(city) => {
                                    setCity(city);
                                    setShowSuggestion(false);
                                }}
                            />
                        </div>
                    </section>
                </div>
            </nav>
            <section className="flex max-w-7xl px-3 md:hidden">
                <div className="relative">
                    <SearchBox
                        value={city}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onSubmit={handleSubmit}
                    />
                    <SuggestionBox
                        {...{ showSuggestion, suggestion, error }}
                        handleSuggestionClick={(city) => {
                            setCity(city);
                            setShowSuggestion(false);
                        }}
                    />
                </div>
            </section>
        </>
    );
}

function SuggestionBox({
    showSuggestion,
    suggestion,
    handleSuggestionClick,
    error,
}: {
    showSuggestion: boolean;
    suggestion: string[];
    handleSuggestionClick: (city: string) => void;
    error: string;
}) {
    return (
        <>
            {((showSuggestion && suggestion.length > 1) || error) && (
                <ul className="mb-4 bg-white absolute border top-[44px] left-0 border-gray-300 rounded-md min-w-[200px] flex flex-col gap-1 py-2 px-2">
                    {error && suggestion.length < 1 && (
                        <li className="p-1 text-red-500">{error}</li>
                    )}
                    {suggestion.map((city, index) => (
                        <li
                            key={index}
                            onClick={() => handleSuggestionClick(city)}
                            className="cursor-pointer p-1 rounded hover:bg-gray-200"
                        >
                            {city}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
