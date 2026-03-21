package com.exe.Huerta_directa.Impl;

import com.exe.Huerta_directa.DTO.PaymentRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;
import java.util.List;

@Service
public class MercadoPagoServicePaymentRequest {

    @Value("${mercadopago.access_token}")
    private String accessToken;

    private static final List<String> NON_CARD_METHODS = Arrays.asList(
            "pse", "efecty", "bancolombia_transfer", "davivienda",
            "pix", "bolbradesco", "account_money", "baloto", "su_red",
            "gana", "point", "redservi");

    public String processPayment(PaymentRequest request) {
        try {
            URI uri = URI.create("https://api.mercadopago.com/v1/payments");
            HttpURLConnection con = (HttpURLConnection) uri.toURL().openConnection();

            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json");
            con.setRequestProperty("Authorization", "Bearer " + accessToken);
            con.setRequestProperty("X-Idempotency-Key", java.util.UUID.randomUUID().toString());
            con.setDoOutput(true);

            Map<String, Object> mpPayload = buildPayload(request);

            ObjectMapper mapper = new ObjectMapper();
            String jsonInput = mapper.writeValueAsString(mpPayload);

            try (OutputStream os = con.getOutputStream()) {
                byte[] input = jsonInput.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = con.getResponseCode();
            BufferedReader br;

            if (responseCode >= 200 && responseCode < 300) {
                br = new BufferedReader(new InputStreamReader(con.getInputStream(), StandardCharsets.UTF_8));
            } else {
                br = new BufferedReader(new InputStreamReader(con.getErrorStream(), StandardCharsets.UTF_8));
            }

            StringBuilder response = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                response.append(line.trim());
            }
            br.close();

            if (responseCode >= 400) {
                throw new RuntimeException("Error de Mercado Pago: " + response);
            }

            return response.toString();

        } catch (Exception e) {
            throw new RuntimeException("Error procesando el pago: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> buildPayload(PaymentRequest request) {
        Map<String, Object> payload = new HashMap<>();

        payload.put("transaction_amount", request.getTransactionAmount());
        payload.put("payment_method_id", request.getPaymentMethodId());
        payload.put("description",
                request.getDescription() != null ? request.getDescription() : "Compra en Huerta Directa");

        // Payer (obligatorio)
        Map<String, Object> payer = new HashMap<>();
        if (request.getPayer() != null) {
            payer.put("email", request.getPayer().getEmail());
            if (request.getPayer().getFirstName() != null)
                payer.put("first_name", request.getPayer().getFirstName());
            if (request.getPayer().getLastName() != null)
                payer.put("last_name", request.getPayer().getLastName());
            if (request.getPayer().getIdentification() != null) {
                Map<String, String> identification = new HashMap<>();
                identification.put("type", request.getPayer().getIdentification().getType());
                identification.put("number", request.getPayer().getIdentification().getNumber());
                payer.put("identification", identification);
            }
        } else {
            payer.put("email", "test@test.com");
        }
        payload.put("payer", payer);

        // Campos SOLO para pagos con tarjeta (crédito/débito)
        if (!isNonCardPayment(request.getPaymentMethodId())) {
            if (request.getToken() != null) {
                payload.put("token", request.getToken());
            }
            if (request.getInstallments() != null) {
                payload.put("installments", request.getInstallments());
            }
            if (request.getIssuerId() != null) {
                payload.put("issuer_id", request.getIssuerId());
            }
        }

        if (request.getStatementDescriptor() != null) {
            payload.put("statement_descriptor", request.getStatementDescriptor());
        }
        if (request.getExternalReference() != null) {
            payload.put("external_reference", request.getExternalReference());
        }
        if (request.getNotificationUrl() != null) {
            payload.put("notification_url", request.getNotificationUrl());
        }

        if (request.getAdditionalInfo() != null) {
            payload.put("additional_info", request.getAdditionalInfo());
        }

        return payload;
    }

    private boolean isNonCardPayment(String paymentMethodId) {
        return NON_CARD_METHODS.contains(paymentMethodId);
    }
}