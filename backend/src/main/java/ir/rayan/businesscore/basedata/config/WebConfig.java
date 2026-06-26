package ir.rayan.businesscore.basedata.config;

import ir.rayan.businesscore.basedata.security.FeatureAccessInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Wires the plan/feature gate into the MVC request pipeline. */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final FeatureAccessInterceptor featureAccessInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(featureAccessInterceptor)
                .addPathPatterns("/api/invoices/**", "/api/inventory/**");
    }
}
