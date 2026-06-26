package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.LoginRequest;
import ir.rayan.businesscore.basedata.dto.response.AuthResponse;
import ir.rayan.businesscore.basedata.dto.response.UserResponse;
import ir.rayan.businesscore.basedata.model.User;
import ir.rayan.businesscore.basedata.repository.UserRepository;
import ir.rayan.businesscore.basedata.security.AppUserDetails;
import ir.rayan.businesscore.basedata.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new UsernameNotFoundException("کاربر یافت نشد"));
        user.setLastLogin(LocalDateTime.now());

        String token = jwtService.generateToken(new AppUserDetails(user));
        return new AuthResponse(token, UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public UserResponse currentUser(String username) {
        return userRepository.findByUsername(username)
                .map(UserResponse::from)
                .orElseThrow(() -> new UsernameNotFoundException("کاربر یافت نشد"));
    }
}
