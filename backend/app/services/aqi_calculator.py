import math
from typing import Dict, Optional, Tuple

# Official US EPA AQI Breakpoints (40 CFR Part 58, Appendix G)
# Each entry: (BP_Lo, BP_Hi, I_Lo, I_Hi)
PM25_BREAKPOINTS = [
    (0.0, 12.0, 0, 50),
    (12.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 150.4, 151, 200),
    (150.5, 250.4, 201, 300),
    (250.5, 350.4, 301, 400),
    (350.5, 500.4, 401, 500),
]

PM10_BREAKPOINTS = [
    (0, 54, 0, 50),
    (55, 154, 51, 100),
    (155, 254, 101, 150),
    (255, 354, 151, 200),
    (355, 424, 201, 300),
    (425, 504, 301, 400),
    (505, 604, 401, 500),
]

CO_PPM_BREAKPOINTS = [
    (0.0, 4.4, 0, 50),
    (4.5, 9.4, 51, 100),
    (9.5, 12.4, 101, 150),
    (12.5, 15.4, 151, 200),
    (15.5, 30.4, 201, 300),
    (30.5, 40.4, 301, 400),
    (40.5, 50.4, 401, 500),
]

SO2_PPB_BREAKPOINTS = [
    (0, 35, 0, 50),
    (36, 75, 51, 100),
    (76, 185, 101, 150),
    (186, 304, 151, 200),
    (305, 604, 201, 300),
    (605, 804, 301, 400),
    (805, 1004, 401, 500),
]

NO2_PPB_BREAKPOINTS = [
    (0, 53, 0, 50),
    (54, 100, 51, 100),
    (101, 360, 101, 150),
    (361, 649, 151, 200),
    (650, 1249, 201, 300),
    (1250, 1649, 301, 400),
    (1650, 2049, 401, 500),
]

O3_PPB_BREAKPOINTS = [
    (0, 54, 0, 50),
    (55, 70, 51, 100),
    (71, 85, 101, 150),
    (86, 105, 151, 200),
    (106, 200, 201, 300),
]

def calculate_linear_aqi(concentration: float, breakpoints) -> Optional[int]:
    """Calculate sub-index using EPA linear interpolation formula."""
    if concentration < 0:
        return None
    for bp_lo, bp_hi, i_lo, i_hi in breakpoints:
        if bp_lo <= concentration <= bp_hi:
            index = ((i_hi - i_lo) / (bp_hi - bp_lo)) * (concentration - bp_lo) + i_lo
            return int(round(index))
    # If concentration exceeds highest breakpoint, extrapolate linearly from top bucket
    top_lo, top_hi, top_i_lo, top_i_hi = breakpoints[-1]
    if concentration > top_hi:
        index = ((top_i_hi - top_i_lo) / (top_hi - top_lo)) * (concentration - top_lo) + top_i_lo
        return int(round(min(500, index)))
    return None

def compute_pm25_aqi(pm25_ug_m3: Optional[float]) -> Optional[int]:
    """EPA PM2.5 24-hr AQI (truncated to 1 decimal place)."""
    if pm25_ug_m3 is None:
        return None
    # Truncate to 1 decimal place
    truncated = math.floor(pm25_ug_m3 * 10) / 10.0
    return calculate_linear_aqi(truncated, PM25_BREAKPOINTS)

def compute_pm10_aqi(pm10_ug_m3: Optional[float]) -> Optional[int]:
    """EPA PM10 24-hr AQI (truncated to integer)."""
    if pm10_ug_m3 is None:
        return None
    truncated = float(math.floor(pm10_ug_m3))
    return calculate_linear_aqi(truncated, PM10_BREAKPOINTS)

def compute_co_aqi(co_ug_m3: Optional[float]) -> Optional[int]:
    """EPA CO AQI (converted to ppm at 25°C, 1 atm, truncated to 1 decimal place)."""
    if co_ug_m3 is None:
        return None
    # 1 ppm CO = 1145 ug/m³
    co_ppm = co_ug_m3 / 1145.0
    truncated = math.floor(co_ppm * 10) / 10.0
    return calculate_linear_aqi(truncated, CO_PPM_BREAKPOINTS)

def compute_so2_aqi(so2_ug_m3: Optional[float]) -> Optional[int]:
    """EPA SO2 1-hr AQI (converted to ppb, truncated to integer)."""
    if so2_ug_m3 is None:
        return None
    # 1 ppb SO2 = 2.62 ug/m³
    so2_ppb = so2_ug_m3 / 2.62
    truncated = float(math.floor(so2_ppb))
    return calculate_linear_aqi(truncated, SO2_PPB_BREAKPOINTS)

def compute_no2_aqi(no2_ug_m3: Optional[float]) -> Optional[int]:
    """EPA NO2 1-hr AQI (converted to ppb, truncated to integer)."""
    if no2_ug_m3 is None:
        return None
    # 1 ppb NO2 = 1.88 ug/m³
    no2_ppb = no2_ug_m3 / 1.88
    truncated = float(math.floor(no2_ppb))
    return calculate_linear_aqi(truncated, NO2_PPB_BREAKPOINTS)

def compute_o3_aqi(o3_ug_m3: Optional[float]) -> Optional[int]:
    """EPA Ozone 8-hr AQI (converted to ppb, truncated to integer)."""
    if o3_ug_m3 is None:
        return None
    # 1 ppb O3 = 1.96 ug/m³
    o3_ppb = o3_ug_m3 / 1.96
    truncated = float(math.floor(o3_ppb))
    return calculate_linear_aqi(truncated, O3_PPB_BREAKPOINTS)

def calculate_us_epa_composite_aqi(
    pm25: Optional[float] = None,
    pm10: Optional[float] = None,
    co: Optional[float] = None,
    so2: Optional[float] = None,
    no2: Optional[float] = None,
    o3: Optional[float] = None,
) -> Tuple[Optional[int], Optional[str], Dict[str, Optional[int]]]:
    """
    Computes sub-indices for all available pollutants according to US EPA standards.
    Returns (overall_aqi, critical_pollutant, sub_indices_dict).
    """
    sub_indices: Dict[str, Optional[int]] = {
        "PM2.5": compute_pm25_aqi(pm25),
        "PM10": compute_pm10_aqi(pm10),
        "CO": compute_co_aqi(co),
        "SO2": compute_so2_aqi(so2),
        "NO2": compute_no2_aqi(no2),
        "O3": compute_o3_aqi(o3),
    }

    valid_items = {k: v for k, v in sub_indices.items() if v is not None}
    if not valid_items:
        return None, None, sub_indices

    # Critical pollutant is the one with the maximum AQI sub-index
    critical_pollutant = max(valid_items, key=lambda k: valid_items[k])
    composite_aqi = valid_items[critical_pollutant]

    return composite_aqi, critical_pollutant, sub_indices
