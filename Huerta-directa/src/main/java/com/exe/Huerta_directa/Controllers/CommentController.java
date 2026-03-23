package com.exe.Huerta_directa.Controllers;

import java.io.FileOutputStream;
import java.time.LocalDate;
import java.util.List;

import org.springframework.http.*;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.data.general.DefaultPieDataset;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.ui.Model;
import com.exe.Huerta_directa.DTO.CommentDTO;
import com.exe.Huerta_directa.Entity.Comment;
import com.exe.Huerta_directa.Entity.CommentType;
import com.exe.Huerta_directa.Entity.User;
import com.exe.Huerta_directa.Service.CommentService;

import org.jfree.chart.ChartUtils;

import java.io.File;
import java.io.OutputStream;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> crearComentario(@RequestBody CommentDTO commentDTO,
            HttpSession session) {
        try {
            // 🔐 Validar sesión
            User userSession = (User) session.getAttribute("user");

            if (userSession == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Debe iniciar sesión");
            }

            // 🧠 Completar datos
            commentDTO.setCreationComment(LocalDate.now());
            commentDTO.setUserId(userSession.getId());

            // 🔥 LÓGICA CLAVE
            if (commentDTO.getProductId() != null) {
                // 👉 Comentario de PRODUCTO
                commentService.crearComment(commentDTO, userSession.getId(), commentDTO.getProductId());
            } else {
                // 👉 Comentario de SITIO
                commentService.crearComment(commentDTO, userSession.getId(), null);
            }

            return ResponseEntity.ok("Comentario creado correctamente");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear comentario");
        }
    }

    @PostMapping("/comment/add")
    public RedirectView crearComentarioProducto(
            @RequestParam("commentCommenter") String commentCommenter,
            @RequestParam("productId") Long productId,
            @RequestParam(value = "rating", required = false) Integer rating,
            HttpSession session) {
        try {
            User userSession = (User) session.getAttribute("user");
            if (userSession == null) {
                return new RedirectView("/login?error=session&message=Debe+iniciar+sesión+para+dejar+una+reseña");
            }

            CommentDTO commentDTO = new CommentDTO();
            commentDTO.setCommentCommenter(commentCommenter);
            commentDTO.setCreationComment(LocalDate.now());
            commentDTO.setUserId(userSession.getId());
            commentDTO.setProductId(productId);
            commentDTO.setRating(rating); // Set the rating

            commentService.crearComment(commentDTO, userSession.getId(), productId);

            return new RedirectView("/producto/" + productId + "?success=¡Gracias+por+tu+reseña!");

        } catch (Exception e) {
            e.printStackTrace();
            return new RedirectView("/producto/" + productId + "?error=No+se+pudo+enviar+tu+reseña");
        }
    }

    @GetMapping("/api/comments/product/{productId}")
    @ResponseBody
    public List<CommentDTO> listarCommentsPorProducto(@PathVariable Long productId) {
        return commentService.listarCommentsPorProducto(productId);
    }

    // ✅ GET — Mostrar comentarios tipo SITE (para la página "quienes somos")
    @GetMapping("/site")
    @ResponseBody
    public ResponseEntity<List<Comment>> obtenerComentariosSitio() {
        List<Comment> comments = commentService.obtenerComentariosPorTipo(CommentType.SITE);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/MensajesComentarios")
    public String mostrarMensajesComentarios(Model model, HttpSession session) {
        // Obtener usuario de la sesión
        User userSession = (User) session.getAttribute("user");
        if (userSession == null) {
            return "redirect:/login?error=session&message=Debe+iniciar+sesión";
        }

        // Obtener todos los comentarios o filtrar por usuario según necesites
        List<Comment> comments = commentService.obtenerComentariosPorUsuario(userSession.getId());

        // O si quieres todos: commentService.obtenerTodosLosComentarios();

        // Añadir comentarios al modelo
        model.addAttribute("comments", comments);

        return "DashBoard/MensajesComentarios";
    }

    // Este apartado esel get mappin de comentarios pero para le admin
    @GetMapping("/MensajesComentariosAdmin")
    public String mostrarMensajesComentariosAdmin(Model model, HttpSession session) {
        // Obtener usuario de la sesión
        User userSession = (User) session.getAttribute("user");
        if (userSession == null) {
            return "redirect:/login?error=session&message=Debe+iniciar+sesión";
        }

        // Obtener todos los comentarios o filtrar por usuario según necesites
        List<Comment> comments = commentService.obtenerComentariosPorUsuario(userSession.getId());

        // O si quieres todos: commentService.obtenerTodosLosComentarios();

        // Añadir comentarios al modelo
        model.addAttribute("comments", comments);

        return "Dashboard_Admin/MensajesComentariosAdmin";
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarComentario(@PathVariable Long id, HttpSession session) {
        try {
            User userSession = (User) session.getAttribute("user");
            if (userSession == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Debe iniciar sesión");
            }
            commentService.eliminarComment(id);
            return ResponseEntity.ok("Comentario eliminado");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar");
        }
    }

    @GetMapping("/editComment/{id}")
    public String editarComentario(@PathVariable Long id, Model model) {
        CommentDTO comment = commentService.obtenerCommentPorId(id);
        model.addAttribute("comment", comment);
        return "DashBoard/EditarComentario";
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarComentarioRest(
            @PathVariable Long id,
            @RequestBody CommentDTO commentDTO,
            HttpSession session) {
        try {
            User userSession = (User) session.getAttribute("user");
            if (userSession == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Debe iniciar sesión");
            }

            commentDTO.setCreationComment(LocalDate.now());
            commentService.actualizarComment(id, commentDTO);
            return ResponseEntity.ok("Comentario actualizado");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al actualizar");
        }
    }

    @GetMapping("/reporteFc")
    public String reporteProductVsSite(Model model) {

        // Traer todos los comentarios
        List<Comment> listaComments = commentService.listarTodosComments();
        model.addAttribute("comentarios", listaComments);

        // Contar comentarios por tipo
        int totalProductComments = 0;
        int totalSiteComments = 0;

        for (Comment c : listaComments) {
            if (c.getCommentType() == CommentType.PRODUCT) {
                totalProductComments++;
            } else if (c.getCommentType() == CommentType.SITE) {
                totalSiteComments++;
            }
        }

        // Crear dataset para el gráfico
        DefaultPieDataset<String> datos = new DefaultPieDataset<>();
        datos.setValue("Comentarios PRODUCT", totalProductComments);
        datos.setValue("Comentarios SITE", totalSiteComments);

        // Crear gráfico
        JFreeChart chart = ChartFactory.createPieChart(
                "Comparación Comentarios PRODUCT vs SITE",
                datos,
                true,
                true,
                false);

        // Guardar gráfico en disco
        String rutaArchivo = "uploads/graficos/reporteProductSite.png";

        try {
            File carpeta = new File("uploads/graficos/");
            if (!carpeta.exists())
                carpeta.mkdirs();

            try (OutputStream out = new FileOutputStream(rutaArchivo)) {
                ChartUtils.writeChartAsPNG(out, chart, 650, 450);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        // Agregar atributos para la vista
        model.addAttribute("grafico", "/uploads/graficos/reporteProductSite.png");
        model.addAttribute("totalProductComments", totalProductComments);
        model.addAttribute("totalSiteComments", totalSiteComments);

        return "Reportes_estadisticos/commentFc";
    }

}
