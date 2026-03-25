package com.exe.Huerta_directa.Controllers.Chats;

import com.exe.Huerta_directa.Entity.User;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ChatController {
    
    @GetMapping("/chat")
public String mostrarChat(HttpSession session, Model model) {
    User user = (User) session.getAttribute("user");
    
    if (user == null) {
        return "redirect:/login";
    }
    
    model.addAttribute("username", user.getName());
    model.addAttribute("userEmail", user.getEmail());
    model.addAttribute("userId", user.getId());
    
    boolean isAdmin = user.getRole() != null && user.getRole().getIdRole() == 1;
    model.addAttribute("isAdmin", isAdmin);
    
    return "chat/chat";  // ← Cambiar de "chat" a "chat/chat"
}
}