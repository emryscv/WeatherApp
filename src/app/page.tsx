"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useQuery } from "react-query";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";
import Container from "@/components/Container";
import { convertKelvinToCelsius } from "@/utils/convertKelvinToCelsius";
import WeatherIcon from "@/components/WeatherIcon";
import { getDayOrNightIcon } from "@/utils/getDayOrNightIcon";
import WeatherDetails from "@/components/WeatherDetails";
import { metersToKilometers } from "@/utils/metersToKilometers";
import { convertWindSpeed } from "@/utils/convertWindSpeed";
import ForecastWeatherDetail from "@/components/ForecastWeatherDetail";
import { useAtom } from "jotai";
import { loadingCityAtom, placeAtom } from "./atom";
import { useEffect } from "react";

//http://api.openweathermap.org/data/2.5/weather?q=Havana,uk&APPID=4a4315618da3248793ae618313350f32
interface WeatherDetail {
    dt: number;
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        sea_level: number;
        grnd_level: number;
        humidity: number;
        temp_kf: number;
    };
    weather: {
        id: number;
        main: string;
        description: string;
        icon: string;
    }[];
    clouds: {
        all: number;
    };
    wind: {
        speed: number;
        deg: number;
        gust: number;
    };
    visibility: number;
    pop: number;
    sys: {
        pod: string;
    };
    dt_txt: string;
}

interface WeatherData {
    cod: string;
    message: number;
    cnt: number;
    list: WeatherDetail[];
    city: {
        id: number;
        name: string;
        coord: {
            lat: number;
            lon: number;
        };
        country: string;
        population: number;
        timezone: number;
        sunrise: number;
        sunset: number;
    };
}
export default function Home() {
    const [place, setPlace] = useAtom(placeAtom);
    const [loadingCity, setLoadingCity] = useAtom(loadingCityAtom);

    const { isLoading, error, data, refetch } = useQuery<WeatherData>(
        "repoData",
        async () => {
            const { data } = await axios.get(
                `http://api.openweathermap.org/data/2.5/forecast?q=${place}&APPID=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
            );
            return data;
        }
    );

    useEffect(() => {
        console.log("place", place);
        refetch();
    }, [place, refetch]);

    const firstData = data?.list[0];

    // console.log("error", error);
    console.log("data", data);

    const uniqueDates = [
        ...new Set(
            data?.list.map(
                (item) => new Date(item.dt * 1000).toISOString().split("T")[0]
            )
        ),
    ];

    const firstDataForEachDate = uniqueDates.map((date) => {
        return data?.list.find((item) => {
            const itemDate = new Date(item.dt * 1000)
                .toISOString()
                .split("T")[0];
            const itemTime = new Date(item.dt * 1000).getHours();
            return itemDate === date && itemTime >= 6;
        });
    });

    if (isLoading)
        return (
            <div className="flex items-center min-h-screen justify-center">
                <p className="animate-bounce">Loading...</p>
            </div>
        );
    return (
        <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
            <Navbar location={data?.city.name ?? ""} />
            <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
                {loadingCity ? (
                    <WeatherSkeleton />
                ) : (
                    <>
                        <section className="space-y-4">
                            <div className="space-y-2">
                                <h2 className="flex gap-1 text-2xl items-end">
                                    <p>
                                        {format(
                                            parseISO(firstData?.dt_txt ?? ""),
                                            "EEEE"
                                        )}
                                    </p>
                                    <p className="text-lg">
                                        (
                                        {format(
                                            parseISO(firstData?.dt_txt ?? ""),
                                            "dd.MM.yyyy"
                                        )}
                                        )
                                    </p>
                                </h2>
                                <Container className="gap-10 px-6 items-center">
                                    <div className="flex flex-col px-4">
                                        <span className="text-5xl">
                                            {convertKelvinToCelsius(
                                                firstData?.main.temp ?? 0
                                            )}
                                            °
                                        </span>
                                        <p className="text-xs space-x-1 whitespace-nowrap">
                                            <span>Feels like</span>
                                            <span>
                                                {convertKelvinToCelsius(
                                                    firstData?.main
                                                        .feels_like ?? 0
                                                )}
                                                °
                                            </span>
                                        </p>
                                        <p className="text-xs space-x-2">
                                            <span>
                                                {convertKelvinToCelsius(
                                                    firstData?.main.temp_min ??
                                                        0
                                                )}
                                                °↓{" "}
                                            </span>
                                            <span>
                                                {" "}
                                                {convertKelvinToCelsius(
                                                    firstData?.main.temp_max ??
                                                        0
                                                )}
                                                °↑
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                                        {data?.list.map((item, index) => {
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex flex-col justify-between gap-2 items-center text-sm font-semibold"
                                                >
                                                    <p className="whitespace-nowrap">
                                                        {format(
                                                            parseISO(
                                                                item.dt_txt ?? 0
                                                            ),
                                                            "h:mm a"
                                                        )}
                                                    </p>
                                                    <WeatherIcon
                                                        iconName={getDayOrNightIcon(
                                                            item?.weather[0]
                                                                .icon,
                                                            item?.dt_txt
                                                        )}
                                                    />
                                                    <p>
                                                        {convertKelvinToCelsius(
                                                            item?.main.temp ?? 0
                                                        )}
                                                        °
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Container>
                            </div>
                            <div className="flex gap-4">
                                <Container className="w-fit justify-center flex-col px-4 items-center">
                                    <p className=" capitalize text-center">
                                        {firstData?.weather[0].description}
                                    </p>
                                    <WeatherIcon
                                        iconName={getDayOrNightIcon(
                                            firstData?.weather[0].icon ?? "",
                                            firstData?.dt_txt ?? ""
                                        )}
                                    />
                                </Container>
                                <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
                                    <WeatherDetails
                                        visibility={metersToKilometers(
                                            firstData?.visibility ?? 0
                                        )}
                                        airPressure={`${firstData?.main.pressure} hPa`}
                                        humidity={`${firstData?.main.humidity}%`}
                                        windSpeed={convertWindSpeed(
                                            firstData?.wind.speed ?? 0
                                        )}
                                        sunrise={format(
                                            fromUnixTime(
                                                data?.city.sunrise ?? 0
                                            ),
                                            "h:mm"
                                        )}
                                        sunset={format(
                                            fromUnixTime(
                                                data?.city.sunset ?? 0
                                            ),
                                            "h:mm"
                                        )}
                                    />
                                </Container>
                            </div>
                        </section>
                        <section className="flex flex-col gap-4 w-full">
                            <p className="text-2xl ">Forecast (7 days)</p>
                            {firstDataForEachDate.map((item, index) => {
                                return (
                                    <ForecastWeatherDetail
                                        key={index}
                                        description={
                                            item?.weather[0].description ?? ""
                                        }
                                        weatherIcon={
                                            item?.weather[0].icon ?? "01d"
                                        }
                                        date={
                                            item
                                                ? format(
                                                      parseISO(item.dt_txt),
                                                      "dd.MM"
                                                  )
                                                : ""
                                        }
                                        day={
                                            item
                                                ? format(
                                                      parseISO(item.dt_txt),
                                                      "EEEE"
                                                  )
                                                : ""
                                        }
                                        feels_like={item?.main.feels_like ?? 0}
                                        temp={item?.main.temp ?? 0}
                                        temp_max={item?.main.temp_max ?? 0}
                                        temp_min={item?.main.temp_min ?? 0}
                                        airPressure={`${item?.main.pressure} hPa`}
                                        humidity={`${item?.main.humidity}% `}
                                        sunrise={format(
                                            fromUnixTime(
                                                data?.city.sunrise ?? 1702517657
                                            ),
                                            "H:mm"
                                        )}
                                        sunset={format(
                                            fromUnixTime(
                                                data?.city.sunset ?? 1702517657
                                            ),
                                            "H:mm"
                                        )}
                                        visibility={`${metersToKilometers(
                                            item?.visibility ?? 10000
                                        )} `}
                                        windSpeed={`${convertWindSpeed(
                                            item?.wind.speed ?? 1.64
                                        )} `}
                                    />
                                );
                            })}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

function WeatherSkeleton() {
    return (
        <section className="space-y-8 ">
            {/* Today's data skeleton */}
            <div className="space-y-2 animate-pulse">
                {/* Date skeleton */}
                <div className="flex gap-1 text-2xl items-end ">
                    <div className="h-6 w-24 bg-gray-300 rounded"></div>
                    <div className="h-6 w-24 bg-gray-300 rounded"></div>
                </div>

                {/* Time wise temperature skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center space-y-2"
                        >
                            <div className="h-6 w-16 bg-gray-300 rounded"></div>
                            <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
                            <div className="h-6 w-16 bg-gray-300 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 7 days forecast skeleton */}
            <div className="flex flex-col gap-4 animate-pulse">
                <p className="text-2xl h-8 w-36 bg-gray-300 rounded"></p>

                {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                    <div
                        key={index}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 "
                    >
                        <div className="h-8 w-28 bg-gray-300 rounded"></div>
                        <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                        <div className="h-8 w-28 bg-gray-300 rounded"></div>
                        <div className="h-8 w-28 bg-gray-300 rounded"></div>
                    </div>
                ))}
            </div>
        </section>
    );
}
