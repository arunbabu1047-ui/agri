import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@mui/material';
import AirRoundedIcon from '@mui/icons-material/AirRounded';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import ThunderstormOutlinedIcon from '@mui/icons-material/ThunderstormOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import './FarmBrief.css';

const places = [
  { id: 'coimbatore', latitude: 11.0168, longitude: 76.9558 },
  { id: 'chennai', latitude: 13.0827, longitude: 80.2707 },
  { id: 'dindigul', latitude: 10.3673, longitude: 77.9803 },
  { id: 'erode', latitude: 11.3410, longitude: 77.7172 },
  { id: 'madurai', latitude: 9.9252, longitude: 78.1198 },
  { id: 'salem', latitude: 11.6643, longitude: 78.1460 },
  { id: 'thanjavur', latitude: 10.7870, longitude: 79.1378 },
  { id: 'tiruchirappalli', latitude: 10.7905, longitude: 78.7047 },
  { id: 'tirunelveli', latitude: 8.7139, longitude: 77.7567 },
];
const storageKey = 'agri-weather-location';
const modeKey = 'agri-weather-location-mode';
const devicePlace = 'device';
const defaultTimeZone = 'Asia/Kolkata';
const cache = new Map();

function readPreference(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function savePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The choice still applies during this visit.
  }
}

function getSavedPlace() {
  const saved = readPreference(storageKey);
  return places.find((place) => place.id === saved) || places[0];
}

function locateDevice() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      resolve({
        id: devicePlace,
        latitude: Number(coords.latitude.toFixed(2)),
        longitude: Number(coords.longitude.toFixed(2)),
      });
    }, reject, { maximumAge: 5 * 60 * 1000, timeout: 8000 });
  });
}

function getForecast(place) {
  const key = [place.id, place.latitude, place.longitude].join(',');
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.promise;

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: place.id === devicePlace ? 'auto' : defaultTimeZone,
    forecast_days: '3',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const promise = fetch(url, { signal: controller.signal }).then(async (response) => {
    if (!response.ok) throw new Error('Forecast request failed');
    const data = await response.json();
    if (!data.current || !Array.isArray(data.daily?.time)) throw new Error('Invalid forecast data');
    return data;
  }).catch((error) => {
    cache.delete(key);
    throw error;
  }).finally(() => clearTimeout(timeout));

  cache.set(key, { promise, expires: Date.now() + 15 * 60 * 1000 });
  return promise;
}

function getCondition(code) {
  if (!Number.isFinite(code)) return ['unknown', CloudOutlinedIcon];
  if (code === 0) return ['clear', WbSunnyOutlinedIcon];
  if (code < 3) return ['partlyCloudy', CloudOutlinedIcon];
  if (code === 3) return ['cloudy', CloudOutlinedIcon];
  if (code <= 48) return ['fog', CloudOutlinedIcon];
  if (code >= 95) return ['thunder', ThunderstormOutlinedIcon];
  if ([71, 73, 75, 77, 85, 86].includes(code)) return ['snow', CloudOutlinedIcon];
  return ['rain', WaterDropOutlinedIcon];
}

export default function FarmBrief() {
  const { t } = useTranslation();
  const { isTamil } = useLanguage();
  const [place, setPlace] = useState(getSavedPlace);
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [locationStatus, setLocationStatus] = useState('');
  const locationRequest = useRef(0);
  const locale = isTamil ? 'ta-IN' : 'en-IN';

  const requestDeviceLocation = useCallback(async (automatic = false) => {
    const request = ++locationRequest.current;
    setLocationStatus('locating');
    try {
      const localPlace = await locateDevice();
      if (request !== locationRequest.current) return;
      setPlace(localPlace);
      setLocationStatus('');
      savePreference(modeKey, devicePlace);
    } catch (error) {
      if (request !== locationRequest.current) return;
      const message = error?.code === 1 ? 'locationDenied' : 'locationUnavailable';
      setLocationStatus(automatic ? '' : message);
    }
  }, []);

  useEffect(() => {
    const initialRequest = locationRequest.current;
    if (navigator.permissions && readPreference(modeKey) !== 'city') {
      navigator.permissions.query({ name: 'geolocation' }).then(({ state }) => {
        if (state === 'granted' && locationRequest.current === initialRequest) requestDeviceLocation(true);
      }).catch(() => {});
    }
    return () => { locationRequest.current += 1; };
  }, [requestDeviceLocation]);

  useEffect(() => {
    let active = true;
    getForecast(place).then((forecast) => {
      if (active) setResult({ place, forecast });
    }).catch(() => {
      if (active) setResult({ place, forecast: null });
    });
    return () => { active = false; };
  }, [place, attempt]);

  function changePlace(event) {
    const next = places.find((entry) => entry.id === event.target.value);
    if (!next) return;
    locationRequest.current += 1;
    setLocationStatus('');
    setPlace(next);
    savePreference(storageKey, next.id);
    savePreference(modeKey, 'city');
  }

  const forecast = result?.place === place ? result.forecast : undefined;
  const current = forecast?.current;
  const daily = forecast?.daily;
  const [condition, WeatherIcon] = getCondition(current?.weather_code);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const dateLabel = new Intl.DateTimeFormat(locale, { timeZone: forecast?.timezone || defaultTimeZone, weekday: 'long', day: 'numeric', month: 'long' });
  // Open-Meteo already returns local clock times for the requested location.
  const dayLabel = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' });
  const timeLabel = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', hour: 'numeric', minute: '2-digit' });
  const measuredAt = new Date(current?.time + 'Z');
  const metrics = [
    { label: 'rainChance', value: daily?.precipitation_probability_max?.[0], unit: '%', Icon: WaterDropOutlinedIcon },
    { label: 'wind', value: current?.wind_speed_10m, unit: ' ' + t('farmBrief.windUnit'), Icon: AirRoundedIcon },
    { label: 'humidity', value: current?.relative_humidity_2m, unit: '%', Icon: CloudOutlinedIcon },
  ];
  const links = [
    { id: 'warnings', href: 'https://mausam.imd.gov.in/imd_latest/contents/districtwise-warning_mc.php?id=26', Icon: CampaignOutlinedIcon },
    { id: 'advisories', href: isTamil ? 'https://mausam.imd.gov.in/imd_latest/contents/agromet/advisory/blocalmain.php' : 'https://tnagriculture.in/people_app/tnau/index/en/20', Icon: MenuBookOutlinedIcon },
    { id: 'prices', href: 'https://www.enam.gov.in/web/dashboard/live_price', Icon: ShowChartRoundedIcon },
  ];

  function withUnit(value, unit) {
    return Number.isFinite(value) ? number.format(value) + unit : '—';
  }

  return (
    <section className="farm-brief" aria-labelledby="farm-brief-title">
      <header className="farm-brief-heading">
        <h2 id="farm-brief-title">{t('farmBrief.title')}</h2>
        <p>{dateLabel.format(new Date())}</p>
      </header>

      <div className="farm-brief-grid">
        <div className="farm-weather">
          <div className="farm-weather-heading">
            <h3>{t('farmBrief.localWeather')}</h3>
            <div className="farm-weather-controls">
              <div className="farm-weather-location">
                <select aria-label={t('farmBrief.location')} value={place.id} onChange={changePlace}>
                  {place.id === devicePlace && <option value={devicePlace} disabled>{t('farmBrief.currentLocation')}</option>}
                  {places.map((entry) => <option key={entry.id} value={entry.id}>{t('farmBrief.places.' + entry.id)}</option>)}
                </select>
                <ExpandMoreRoundedIcon aria-hidden="true" />
              </div>
              <Button
                type="button"
                variant="outlined"
                className="farm-weather-use-location"
                startIcon={<MyLocationRoundedIcon aria-hidden="true" />}
                disabled={locationStatus === 'locating'}
                onClick={() => requestDeviceLocation()}
              >
                {t(locationStatus === 'locating' ? 'farmBrief.locating' : 'farmBrief.useLocation')}
              </Button>
            </div>
          </div>
          {locationStatus && locationStatus !== 'locating' && (
            <p role="status" className="farm-weather-location-status">{t('farmBrief.' + locationStatus)}</p>
          )}

          {forecast === undefined ? <p role="status">{t('farmBrief.loading')}</p> : !forecast ? (
            <div className="farm-weather-unavailable">
              <p role="status">{t('farmBrief.unavailable')}</p>
              <Button variant="outlined" onClick={() => {
                setResult(null);
                setAttempt((count) => count + 1);
              }}>{t('common.retry')}</Button>
            </div>
          ) : (
            <>
              <div className="farm-weather-current">
                <span className="farm-weather-symbol"><WeatherIcon aria-hidden="true" /></span>
                <div>
                  <strong>{withUnit(current.temperature_2m, '°C')}</strong>
                  <span>{t('farmBrief.conditions.' + condition)}</span>
                </div>
              </div>

              <dl className="farm-weather-metrics">
                {metrics.map(({ label, value, unit, Icon }) => (
                  <div key={label}>
                    <dt><Icon aria-hidden="true" /> {t('farmBrief.' + label)}</dt>
                    <dd>{withUnit(value, unit)}</dd>
                  </div>
                ))}
              </dl>

              <h4>{t('farmBrief.forecast')}</h4>
              <ul className="farm-weather-days">
                {daily.time.map((date, index) => (
                  <li key={date}>
                    <time dateTime={date}>{dayLabel.format(new Date(date + 'T12:00:00Z'))}</time>
                    <span>{withUnit(daily.temperature_2m_max?.[index], '°')} / {withUnit(daily.temperature_2m_min?.[index], '°')}</span>
                    <span>{t('farmBrief.rainOnDay', { value: withUnit(daily.precipitation_probability_max?.[index], '%') })}</span>
                  </li>
                ))}
              </ul>
              <p className="farm-weather-source">
                {Number.isFinite(measuredAt.getTime()) && t('farmBrief.asOf', {
                  time: dayLabel.format(measuredAt) + ' · ' + timeLabel.format(measuredAt),
                }) + ' · '}
                <a href="https://open-meteo.com/">{t('farmBrief.source')}</a>
              </p>
            </>
          )}
        </div>

        <nav className="farm-daily-checks" aria-labelledby="farm-daily-checks-title">
          <h3 id="farm-daily-checks-title">{t('farmBrief.checkFirst')}</h3>
          <ul>
            {links.map(({ id, href, Icon }) => (
              <li key={id}>
                <a href={href}>
                  <span className="farm-check-icon"><Icon aria-hidden="true" /></span>
                  <span>
                    <strong>{t('farmBrief.links.' + id)}</strong>
                    <span>{t('farmBrief.linkDetails.' + id)}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
