package com.exe.Huerta_directa.Controllers.Chats;

import com.exe.Huerta_directa.Entity.User;
import com.exe.Huerta_directa.Service.Chats.ChatSocialService;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class SocialMessagesController {

    private final ChatSocialService chatService;

    public SocialMessagesController(ChatSocialService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/MensajesAreaSocial")
    public String MensajesAreaSocial(Model model, HttpSession session) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "redirect:/login";
        }

        model.addAttribute("currentUser", user);
        return "DashBoard/MensajesAreaSocial";
    }

    @GetMapping("/MensajesAreaSocial/mensajes")
    @ResponseBody
    public Object loadMessages() {
        return chatService.getAllMessages();
    }
}
