package com.exe.Huerta_directa.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;
import java.util.List;

@Data
public class PaymentRequest {

    @JsonProperty("transaction_amount")
    private BigDecimal transactionAmount;

    @JsonProperty("token")
    private String token; // Solo para tarjetas

    @JsonProperty("installments")
    private Integer installments; // Solo para tarjetas

    @JsonProperty("payment_method_id")
    private String paymentMethodId; // Ej: "visa", "pse", "efecty"

    @JsonProperty("issuer_id")
    private String issuerId; // Solo para tarjetas

    @JsonProperty("payer")
    private Payer payer;

    @JsonProperty("description")
    private String description;

    @JsonProperty("statement_descriptor")
    private String statementDescriptor;

    @JsonProperty("external_reference")
    private String externalReference;

    @JsonProperty("notification_url")
    private String notificationUrl;
    

    // Campos adicionales para pagos sin tarjeta
    @JsonProperty("transaction_details")
    private Map<String, Object> transactionDetails;

    @JsonProperty("additional_info")
    private Map<String, Object> additionalInfo;

    @JsonProperty("carrito")
    private List<CarritoItem> carrito;

    

    @Data
    public static class Payer {
        
        private String email;

        @JsonProperty("first_name")
        private String firstName;

        @JsonProperty("last_name")
        private String lastName;

        @JsonProperty("identification")
        private Identification identification;

        @JsonProperty("entity_type")
        private String entityType; // "individual" o "association"

        @Data
        public static class Identification {
            private String type; // "CC", "CE", "NIT"
            private String number;
        }
    }
}