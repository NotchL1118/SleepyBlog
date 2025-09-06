"use client";

import { motion } from "framer-motion";
import { Clock, Globe, MapPin, Navigation, Thermometer } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ItemContainer from "../ItemContainer";

// 高德地图相关类型定义
interface AMapMarker {
  on: (event: string, callback: () => void) => void;
}

interface AMapInfoWindow {
  open: (map: AMapInstance, position: number[]) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AMapIcon {}

interface AMapIconConstructor {
  new (options: { size: AMapSize; image: string; imageSize: AMapSize }): AMapIcon;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AMapSize {}

interface AMapSizeConstructor {
  new (width: number, height: number): AMapSize;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AMapPixel {}

interface AMapPixelConstructor {
  new (x: number, y: number): AMapPixel;
}

interface AMapWeather {
  getLive: (city: string, callback: (err: Error | null, data: WeatherData | null) => void) => void;
}

interface AMapWeatherConstructor {
  new (): AMapWeather;
}

interface AMapInstance {
  add: (marker: AMapMarker) => void;
  setCenter: (center: number[]) => void;
  setZoom: (zoom: number) => void;
}

interface AMapConstructor {
  Map: new (
    container: HTMLElement,
    options: {
      zoom: number;
      center: number[];
      mapStyle: string;
      showLabel: boolean;
      viewMode: string;
      pitch: number;
      rotation: number;
      animateEnable: boolean;
      jogEnable: boolean;
      scrollWheel: boolean;
      doubleClickZoom: boolean;
      keyboardEnable: boolean;
      dragEnable: boolean;
      zoomEnable: boolean;
      resizeEnable: boolean;
    }
  ) => AMapInstance;
  Marker: new (options: { position: number[]; title: string; icon: AMapIcon }) => AMapMarker;
  InfoWindow: new (options: { content: string; offset: AMapPixel }) => AMapInfoWindow;
  Icon: AMapIconConstructor;
  Size: AMapSizeConstructor;
  Pixel: AMapPixelConstructor;
  Weather: AMapWeatherConstructor;
  plugin: (pluginName: string, callback: () => void) => void;
}

// 天气数据类型
interface WeatherData {
  temperature: string;
  weather: string;
  humidity: string;
}

declare global {
  interface Window {
    AMap: AMapConstructor;
    _AMapSecurityConfig: {
      securityJsCode: string;
    };
  }
}

const Location = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<AMapInstance | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  // 上海闵行区坐标
  const center = useMemo(() => [121.375972, 31.111891], []);

  useEffect(() => {
    const initMap = async () => {
      try {
        // 设置高德地图安全密钥
        window._AMapSecurityConfig = {
          securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE || "",
        };

        // 动态加载高德地图API
        const script = document.createElement("script");
        const apiKey = process.env.NEXT_PUBLIC_AMAP_API_KEY || "";

        if (!apiKey) {
          console.warn("AMap API key not found, using fallback display");
          setMapError(true);
          setLoading(false);
          return;
        }

        script.src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}&plugin=AMap.Weather`;
        script.async = true;

        script.onload = () => {
          if (window.AMap && mapRef.current) {
            // 创建地图实例
            const mapInstance = new window.AMap.Map(mapRef.current, {
              zoom: 12,
              center: center,
              mapStyle: "amap://styles/blue", // 使用蓝色主题
              showLabel: true,
              viewMode: "3D",
              pitch: 40,
              rotation: 0,
              animateEnable: true,
              jogEnable: true,
              scrollWheel: true,
              doubleClickZoom: true,
              keyboardEnable: true,
              dragEnable: true,
              zoomEnable: true,
              resizeEnable: true,
            });

            // 添加标记点
            const marker = new window.AMap.Marker({
              position: center,
              title: "上海闵行区",
              icon: new window.AMap.Icon({
                size: new window.AMap.Size(40, 50),
                image: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                imageSize: new window.AMap.Size(40, 50),
              }),
            });

            mapInstance.add(marker);

            // 添加信息窗体
            const infoWindow = new window.AMap.InfoWindow({
              content: `
                <div style="padding: 10px; font-size: 14px;">
                  <h4 style="margin: 0 0 8px 0; color: #333;">📍 我的位置</h4>
                  <p style="margin: 0; color: #666;">上海市闵行区</p>
                  <p style="margin: 4px 0 0 0; color: #999; font-size: 12px;">这里是我工作和生活的地方</p>
                </div>
              `,
              offset: new window.AMap.Pixel(0, -30),
            });

            // 点击标记显示信息窗体
            marker.on("click", () => {
              infoWindow.open(mapInstance, center);
            });

            setMap(mapInstance);
            setLoading(false);

            // 获取天气信息
            window.AMap.plugin("AMap.Weather", () => {
              const weatherInstance = new window.AMap.Weather();
              weatherInstance.getLive("上海市", (err: Error | null, data: WeatherData | null) => {
                if (!err && data) {
                  setWeather(data);
                }
              });
            });
          }
        };

        script.onerror = () => {
          console.error("Failed to load AMap script");
          setMapError(true);
          setLoading(false);
        };

        document.head.appendChild(script);

        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError(true);
        setLoading(false);
      }
    };

    initMap();
  }, [center]);

  // 备用显示组件
  const FallbackMapDisplay = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex h-64 w-full flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:border-gray-600 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-4 text-white shadow-lg"
      >
        <Globe size={32} />
      </motion.div>

      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">📍 上海市闵行区</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">我的工作与生活之地</p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>经度: {center[0]}</span>
          <span>纬度: {center[1]}</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-sm text-center text-xs text-gray-400 dark:text-gray-500"
      >
        💡 地图功能需要配置高德地图API密钥
        <br />
        请在 .env.local 中添加 NEXT_PUBLIC_AMAP_API_KEY
      </motion.div>
    </motion.div>
  );

  return (
    <ItemContainer title="My Location">
      <div className="space-y-4">
        {/* 位置信息头部 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="rounded-full bg-gradient-to-br from-red-500 to-pink-500 p-2 text-white shadow-lg"
            >
              <MapPin size={20} />
            </motion.div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">上海市闵行区</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">我的工作与生活之地</p>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-2 text-white shadow-md"
            onClick={() => {
              if (map) {
                map.setCenter(center);
                map.setZoom(15);
              }
            }}
          >
            <Navigation size={16} />
          </motion.div>
        </motion.div>

        {/* 天气信息 */}
        {weather && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-4 rounded-lg border border-blue-200/50 bg-gradient-to-r from-blue-50 to-cyan-50 p-3 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-cyan-900/20"
          >
            <div className="flex items-center gap-2">
              <Thermometer size={16} className="text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{weather.temperature}°C</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{weather.weather}</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">湿度: {weather.humidity}%</div>
          </motion.div>
        )}

        {/* 地图容器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {mapError ? (
            <FallbackMapDisplay />
          ) : (
            <>
              <div
                ref={mapRef}
                className="h-64 w-full overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg dark:border-gray-700"
                style={{ minHeight: "256px" }}
              />

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent"
                  />
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* 位置详情 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 gap-4 text-sm"
        >
          <div className="rounded-lg border border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50 p-3 dark:border-green-800/50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="font-medium text-gray-800 dark:text-white">经度</div>
            <div className="text-gray-600 dark:text-gray-400">{center[0]}</div>
          </div>
          <div className="rounded-lg border border-purple-200/50 bg-gradient-to-br from-purple-50 to-pink-50 p-3 dark:border-purple-800/50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="font-medium text-gray-800 dark:text-white">纬度</div>
            <div className="text-gray-600 dark:text-gray-400">{center[1]}</div>
          </div>
        </motion.div>

        {/* 底部说明 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 {mapError ? "配置API密钥后可显示交互地图" : "点击地图标记查看详细信息，点击导航按钮回到中心位置"}
          </p>
        </motion.div>
      </div>
    </ItemContainer>
  );
};

export default Location;
