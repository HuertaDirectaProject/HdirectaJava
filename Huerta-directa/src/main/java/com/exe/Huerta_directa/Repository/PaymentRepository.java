package com.exe.Huerta_directa.Repository;

import com.exe.Huerta_directa.Entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Payment findByPreferenceId(String preferenceId);

    @Query("SELECT DISTINCT p FROM Payment p LEFT JOIN FETCH p.items WHERE p.status = :status ORDER BY p.paymentDate DESC, p.id DESC")
    List<Payment> findAllByStatusWithItems(@Param("status") String status);
}
