package com.exe.Huerta_directa.Controllers;

import com.exe.Huerta_directa.DTO.ProductDTO;
import com.exe.Huerta_directa.Service.ProductService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.awt.Color;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Controller
public class ProductExportController {

    @Autowired
    private ProductService productService;

@GetMapping({"/exportar_productos_excel", "/api/products/exportExcel"})
public void exportarProductosExcel(
        HttpServletResponse response,
        @RequestParam(required = false) String buscar,
        @RequestParam(required = false) String categoria) throws IOException {

    ServletOutputStream out = null;
    Workbook workbook = null;

    try {
        // Obtener productos según filtros
        List<ProductDTO> productos = obtenerProductosFiltrados(buscar, categoria);

        // Configurar respuesta HTTP
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String filename = "Productos_" + LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";

        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);

        // Crear libro
        workbook = new XSSFWorkbook(); // si tienes muchos datos: new SXSSFWorkbook();
        Sheet sheet = workbook.createSheet("Productos");

        // Encabezados
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("ID");
        headerRow.createCell(1).setCellValue("Nombre");
        headerRow.createCell(2).setCellValue("Precio");
        headerRow.createCell(3).setCellValue("Categoría");
        headerRow.createCell(4).setCellValue("Unidad");
        headerRow.createCell(5).setCellValue("Descripción");
        headerRow.createCell(6).setCellValue("Fecha Publicación");
        headerRow.createCell(7).setCellValue("Stock");

        // Datos
        int rowNum = 1;

        for (ProductDTO producto : productos) {
            Row row = sheet.createRow(rowNum++);

            // ID
            row.createCell(0).setCellValue(producto.getIdProduct());

            // Nombre
            row.createCell(1).setCellValue(
                    producto.getNameProduct() != null ? producto.getNameProduct() : "N/A"
            );

            // Precio seguro
            double precio = 0.0;
            try {
                if (producto.getPrice() != null) {
                    precio = producto.getPrice().doubleValue();
                }
            } catch (Exception e) {
                precio = 0.0;
            }
            row.createCell(2).setCellValue(precio);

            // Categoría
            row.createCell(3).setCellValue(
                    producto.getCategory() != null ? producto.getCategory() : "N/A"
            );

            // Unidad
            row.createCell(4).setCellValue(
                    producto.getUnit() != null ? producto.getUnit() : "N/A"
            );

            // Descripción
            row.createCell(5).setCellValue(
                    producto.getDescriptionProduct() != null ? producto.getDescriptionProduct() : "N/A"
            );

            // Fecha segura
            String fecha = "N/A";
            try {
                if (producto.getPublicationDate() != null) {
                    fecha = producto.getPublicationDate().toString();
                }
            } catch (Exception e) {
                fecha = "N/A";
            }
            row.createCell(6).setCellValue(fecha);

            // Stock seguro
            int stock = 0;
            try {
                stock = producto.getStock();
            } catch (Exception e) {
                stock = 0;
            }
            row.createCell(7).setCellValue(stock);
        }

        // Ajustar columnas
        for (int i = 0; i < 8; i++) {
            sheet.autoSizeColumn(i);
        }

        // Escribir archivo
        out = response.getOutputStream();
        workbook.write(out);
        out.flush();

    } catch (Exception e) {
        e.printStackTrace(); // aquí ves el error real en producción
    } finally {
        try {
            if (out != null) out.close();
        } catch (Exception ignored) {}

        try {
            if (workbook != null) workbook.close();
        } catch (Exception ignored) {}
    }
}
    @GetMapping({"/exportar_productos_pdf", "/api/products/exportPdf"})
    public void exportarProductosPdf(
            HttpServletResponse response,
            @RequestParam(required = false) String buscar,
            @RequestParam(required = false) String categoria) throws IOException, DocumentException {
        
        // Obtener productos según filtros
        List<ProductDTO> productos = obtenerProductosFiltrados(buscar, categoria);

        // Configurar respuesta HTTP
        response.setContentType("application/pdf");
        String filename = "Productos_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        // Crear documento PDF
        Document document = new Document();
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        // Título
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.GREEN.darker());
        Paragraph title = new Paragraph("HUERTA DIRECTA", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        // Subtítulo
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.BLACK);
        Paragraph subtitle = new Paragraph("Reporte de Productos", subtitleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(10);
        document.add(subtitle);

        // Información del reporte
        Font infoFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
        String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        Paragraph reportInfo = new Paragraph("Fecha: " + currentDate + " | Total: " + productos.size() + " productos", infoFont);
        reportInfo.setAlignment(Element.ALIGN_RIGHT);
        reportInfo.setSpacingAfter(20);
        document.add(reportInfo);

        // Crear tabla
        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);
        float[] columnWidths = {1f, 2.5f, 1.5f, 2f, 1.5f, 3f, 1.5f};
        table.setWidths(columnWidths);

        // Encabezados
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
        addTableHeader(table, "ID", headerFont);
        addTableHeader(table, "Nombre", headerFont);
        addTableHeader(table, "Precio", headerFont);
        addTableHeader(table, "Categoría", headerFont);
        addTableHeader(table, "Unidad", headerFont);
        addTableHeader(table, "Descripción", headerFont);
        addTableHeader(table, "Stock", headerFont);

        // Datos
        Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
        int rowCount = 0;
        for (ProductDTO producto : productos) {
            rowCount++;
            Color rowColor = (rowCount % 2 == 0) ? new Color(240, 240, 240) : Color.WHITE;

            addTableCell(table, String.valueOf(producto.getIdProduct()), dataFont, rowColor, Element.ALIGN_CENTER);
            addTableCell(table, producto.getNameProduct(), dataFont, rowColor, Element.ALIGN_LEFT);
            addTableCell(table, "$" + producto.getPrice().toString(), dataFont, rowColor, Element.ALIGN_RIGHT);
            addTableCell(table, producto.getCategory(), dataFont, rowColor, Element.ALIGN_LEFT);
            addTableCell(table, producto.getUnit(), dataFont, rowColor, Element.ALIGN_CENTER);
            
            
            // Truncar descripción si es muy larga
            String desc = producto.getDescriptionProduct();
            if (desc.length() > 50) {
                desc = desc.substring(0, 47) + "...";
            }
            addTableCell(table, desc, dataFont, rowColor, Element.ALIGN_LEFT);
            addTableCell(table, String.valueOf(producto.getStock()), dataFont, rowColor, Element.ALIGN_CENTER);
        }

        document.add(table);

        // Pie de página
        Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.GRAY);
        Paragraph footer = new Paragraph("Reporte generado por Huerta Directa", footerFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(30);
        document.add(footer);

        document.close();
    }

    // Métodos auxiliares
    private List<ProductDTO> obtenerProductosFiltrados(String buscar, String categoria) {
        if (buscar != null && !buscar.trim().isEmpty()) {
            return productService.buscarPorNombre(buscar.trim());
        } else if (categoria != null && !categoria.isEmpty() && !categoria.equals("Por categoría")) {
            return productService.buscarPorCategoria(categoria);
        } else {
            return productService.listarProducts();
        }
    }

    private void addTableHeader(PdfPTable table, String headerTitle, Font font) {
        PdfPCell header = new PdfPCell();
        header.setBackgroundColor(new Color(139, 195, 74));
        header.setBorderWidth(1);
        header.setPhrase(new Phrase(headerTitle, font));
        header.setHorizontalAlignment(Element.ALIGN_CENTER);
        header.setVerticalAlignment(Element.ALIGN_MIDDLE);
        header.setPadding(8);
        table.addCell(header);
    }

    private void addTableCell(PdfPTable table, String text, Font font, Color backgroundColor, int alignment) {
        PdfPCell cell = new PdfPCell();
        cell.setPhrase(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBackgroundColor(backgroundColor);
        cell.setPadding(5);
        cell.setBorderWidth(1);
        table.addCell(cell);
    }
}