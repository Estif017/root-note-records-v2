package org.yearup.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.yearup.data.ProductDao;
import org.yearup.models.Product;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@CrossOrigin
public class RecommendationsController {

    private final ProductDao productDao;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${anthropic.api.key}")
    private String apiKey;

    public RecommendationsController(ProductDao productDao) {
        this.productDao = productDao;
    }

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<String> getRecommendations(@PathVariable int id) {
        Product product = productDao.getById(id);

        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        String prompt = String.format(
                "You are a music recommendation assistant for a vinyl record store. " +
                        "A customer is viewing: \"%s\" by %s (genre: %s, price: $%.2f). " +
                        "Suggest 3 other vinyl records they might enjoy. " +
                        "Return JSON only, no explanation, no markdown. Format: " +
                        "[{\"title\":\"...\",\"artist\":\"...\",\"reason\":\"...\"}]",
                product.getName(),
                product.getDescription(),
                product.getSubCategory(),
                product.getPrice()
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = Map.of(
                "model", "claude-haiku-4-5",
                "max_tokens", 500,
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                )
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.anthropic.com/v1/messages",
                    request,
                    Map.class
            );

            Map content = (Map) ((List) response.getBody().get("content")).get(0);
            String recommendations = (String) content.get("text");
            recommendations = recommendations.replaceAll("(?s)^```[a-zA-Z]*\\s*", "").replaceAll("(?s)\\s*```$", "").trim();

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(recommendations);

        } catch (Exception e) {
            System.err.println("Recommendations error: " + e.getMessage());
            return ResponseEntity.status(500).body("[]");
        }
    }
}