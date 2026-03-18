package com.exe.Huerta_directa.Service;

import com.exe.Huerta_directa.DTO.StatsDTO;

public interface StatsService {
    StatsDTO getAdminStats();
    StatsDTO getClientStats(Long userId);
}
