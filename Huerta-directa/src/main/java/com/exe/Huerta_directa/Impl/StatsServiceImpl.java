package com.exe.Huerta_directa.Impl;

import com.exe.Huerta_directa.DTO.StatsDTO;
import com.exe.Huerta_directa.Entity.Payment;
import com.exe.Huerta_directa.Entity.PaymentItem;
import com.exe.Huerta_directa.Entity.Product;
import com.exe.Huerta_directa.Entity.User;
import com.exe.Huerta_directa.Repository.PaymentRepository;
import com.exe.Huerta_directa.Repository.ProductRepository;
import com.exe.Huerta_directa.Repository.UserRepository;
import com.exe.Huerta_directa.Service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public StatsDTO getAdminStats() {
        List<User> users = userRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<Payment> payments = paymentRepository.findAll().stream()
                .filter(p -> "approved".equals(p.getStatus()))
                .collect(Collectors.toList());

        StatsDTO.AdminStats adminStats = StatsDTO.AdminStats.builder()
                .rolesCount(users.stream()
                        .collect(Collectors.groupingBy(u -> u.getRole().getName(), Collectors.counting())))
                .genderCount(users.stream()
                        .filter(u -> u.getGender() != null)
                        .collect(Collectors.groupingBy(u -> switch (u.getGender()) {
                            case "M" -> "Masculino";
                            case "F" -> "Femenino";
                            case "O" -> "Otro";
                            default -> "No especificado";
                        }, Collectors.counting())))
                .ageRangeCount(users.stream()
                        .collect(Collectors.groupingBy(User::getAgeRange, Collectors.counting())))
                .monthlyUserRegistrations(users.stream()
                        .filter(u -> u.getCreacionDate() != null)
                        .collect(Collectors.groupingBy(u -> u.getCreacionDate().getMonth()
                                .getDisplayName(TextStyle.FULL, new Locale("es", "ES")), Collectors.counting())))
                .categoryCount(products.stream()
                        .collect(Collectors.groupingBy(Product::getCategory, Collectors.counting())))
                .unitCount(products.stream()
                        .collect(Collectors.groupingBy(Product::getUnit, Collectors.counting())))
                .monthlySales(payments.stream()
                        .collect(Collectors.groupingBy(p -> p.getPaymentDate().getMonth()
                                .getDisplayName(TextStyle.FULL, new Locale("es", "ES")),
                                Collectors.reducing(BigDecimal.ZERO, 
                                    p -> p.getItems().stream()
                                            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                                            .reduce(BigDecimal.ZERO, BigDecimal::add), 
                                    BigDecimal::add))))
                .topProducts(payments.stream()
                        .flatMap(p -> p.getItems().stream())
                        .collect(Collectors.groupingBy(PaymentItem::getTitle, Collectors.summingLong(PaymentItem::getQuantity))))
                .revenueTrends(payments.stream()
                        .collect(Collectors.groupingBy(p -> p.getPaymentDate().getMonth()
                                .getDisplayName(TextStyle.FULL, new Locale("es", "ES")),
                                Collectors.reducing(BigDecimal.ZERO, 
                                    p -> p.getItems().stream()
                                            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                                            .reduce(BigDecimal.ZERO, BigDecimal::add), 
                                    BigDecimal::add)))
                        .entrySet().stream()
                        .map(e -> new StatsDTO.MonthlyRevenue(e.getKey(), e.getValue()))
                        .collect(Collectors.toList()))
                .build();

        return StatsDTO.builder().adminStats(adminStats).build();
    }

    @Override
    public StatsDTO getClientStats(Long userId) {
        List<Product> myProducts = productRepository.findByUserId(userId);
        
        // Asumiendo que el cliente puede ser un vendedor y queremos sus ventas
        // Esto requeriría que PaymentItem o Product tenga una referencia al vendedor.
        // Por ahora, simularemos o dejaremos vacío si no hay relación directa fácil.
        
        StatsDTO.ClientStats clientStats = StatsDTO.ClientStats.builder()
                .myCategoryCount(myProducts.stream()
                        .collect(Collectors.groupingBy(Product::getCategory, Collectors.counting())))
                .myUnitCount(myProducts.stream()
                        .collect(Collectors.groupingBy(Product::getUnit, Collectors.counting())))
                .priceAnalysis(myProducts.stream()
                        .map(p -> new StatsDTO.PricePoint(p.getPublicationDate().toString(), p.getPrice(), p.getNameProduct()))
                        .collect(Collectors.toList()))
                .myMonthlySales(new HashMap<>()) // Requiere esquema de ventas por vendedor
                .totalRevenue(BigDecimal.ZERO)
                .build();

        return StatsDTO.builder().clientStats(clientStats).build();
    }
}
