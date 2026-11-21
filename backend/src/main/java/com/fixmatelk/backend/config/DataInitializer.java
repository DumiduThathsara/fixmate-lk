package com.fixmatelk.backend.config;

import com.fixmatelk.backend.entity.Notification;
import com.fixmatelk.backend.entity.TechnicianProfile;
import com.fixmatelk.backend.entity.User;
import com.fixmatelk.backend.enums.Role;
import com.fixmatelk.backend.repository.NotificationRepository;
import com.fixmatelk.backend.repository.TechnicianProfileRepository;
import com.fixmatelk.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TechnicianProfileRepository technicianRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (!userRepository.existsByEmailIgnoreCase("kamal@fixmate.lk")) {
            userRepository.save(User.builder()
                    .name("Kamal Perera")
                    .email("kamal@fixmate.lk")
                    .passwordHash(passwordEncoder.encode("Customer@123"))
                    .phone("077 245 8890")
                    .district("Colombo")
                    .address("No. 42, Galle Road, Dehiwala, Colombo")
                    .role(Role.CUSTOMER)
                    .build());
        }

        if (userRepository.count() == 0) {
            // 1. Default Admin
            userRepository.save(User.builder()
                    .name("System Administrator")
                    .email("admin@fixmate.lk")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .phone("011 234 5678")
                    .district("Colombo")
                    .role(Role.ADMIN)
                    .build());

            // 2. Sample Customer
            userRepository.save(User.builder()
                    .name("Kamal Perera")
                    .email("kamal@fixmate.lk")
                    .passwordHash(passwordEncoder.encode("Customer@123"))
                    .phone("077 245 8890")
                    .district("Colombo")
                    .address("No. 42, Galle Road, Dehiwala, Colombo")
                    .role(Role.CUSTOMER)
                    .build());

            // 3. Verified Sri Lankan Sample Technicians
            seedTechnician("Kasun Perera", "kasun.tech@fixmate.lk", "077 456 7890",
                    "Plumbing", "Colombo", 4.9, 124, 1500, 8, true, 1.8,
                    List.of("Plumbing", "Pressure Pumps", "Leak Detection"),
                    "Specialist in residential pipework, pressure pump installation, and bathroom fitting.",
                    "https://randomuser.me/api/portraits/men/32.jpg");

            seedTechnician("Nimal Silva", "nimal.tech@fixmate.lk", "071 834 1120",
                    "Electrical", "Gampaha", 4.8, 98, 1800, 10, true, 2.4,
                    List.of("Electrical", "Rewiring", "Solar Inverters"),
                    "Certified electrician for domestic rewiring, surge protection, and solar inverter setups.",
                    "https://randomuser.me/api/portraits/men/44.jpg");

            seedTechnician("Ruwan Jayawardena", "ruwan.tech@fixmate.lk", "076 512 3349",
                    "AC Repair", "Kandy", 5.0, 142, 2500, 9, true, 3.1,
                    List.of("AC Repair", "Inverter AC", "Gas Refilling"),
                    "Split & inverter AC servicing, refrigerant refilling, and full chemical wash.",
                    "https://randomuser.me/api/portraits/men/68.jpg");

            seedTechnician("Tharindu Bandara", "tharindu.tech@fixmate.lk", "077 908 4412",
                    "Carpentry", "Galle", 4.7, 76, 1500, 7, true, 2.9,
                    List.of("Carpentry", "Teak Furniture", "Smart Locks"),
                    "Teak & mahogany furniture repair, door alignment, and custom pantry cupboards.",
                    "https://randomuser.me/api/portraits/men/75.jpg");

            seedTechnician("Mohamed Fazil", "fazil.tech@fixmate.lk", "077 334 9981",
                    "Appliance Repair", "Kurunegala", 4.8, 89, 1750, 6, true, 3.7,
                    List.of("Washing Machines", "Inverter Fridges", "Microwaves"),
                    "Front-load washing machine, inverter fridge, and microwave circuit diagnostics.",
                    "https://randomuser.me/api/portraits/men/12.jpg");

            seedTechnician("Dinesh Fernando", "dinesh.tech@fixmate.lk", "077 611 2204",
                    "Electrical", "Colombo", 4.9, 115, 2200, 12, true, 1.5,
                    List.of("Three-Phase DB", "CCTV Power", "Fault Tracing"),
                    "Three-phase distribution boards, CCTV power cabling, and emergency fault tracing.",
                    "https://randomuser.me/api/portraits/men/22.jpg");

            seedTechnician("Suresh Kumar", "suresh.tech@fixmate.lk", "071 229 8810",
                    "Painting", "Kandy", 4.6, 63, 1200, 11, true, 4.2,
                    List.of("Interior Painting", "Waterproofing", "Wood Polish"),
                    "Interior emulsion, exterior weather-shield coating, and dampness waterproofing.",
                    "https://randomuser.me/api/portraits/men/18.jpg");

            // Pending verification technician for Admin Queue
            seedTechnician("Gayan Madhushanka", "gayan.pending@fixmate.lk", "077 623 9012",
                    "Plumbing", "Gampaha", 4.7, 12, 1400, 5, false, 3.0,
                    List.of("Plumbing", "Solar Piping"),
                    "Specialist in domestic plumbing, pressure pump repairs, and solar hot-water piping.",
                    "https://randomuser.me/api/portraits/men/83.jpg");
        }

        if (notificationRepository.count() == 0) {
            notificationRepository.saveAll(List.of(
                    Notification.builder()
                            .targetRole("CUSTOMER")
                            .title("Welcome to FixMate LK")
                            .message("Browse verified technicians across all 25 districts in Sri Lanka.")
                            .link("/technicians")
                            .build(),
                    Notification.builder()
                            .targetRole("ADMIN")
                            .title("Pending Technician Verification")
                            .message("New technician application awaiting ID verification.")
                            .link("/admin/dashboard")
                            .build()
            ));
        }
    }

    private void seedTechnician(
            String name, String email, String phone, String category, String district,
            double rating, int reviewCount, int visitFee, int experienceYears,
            boolean verified, double distanceKm, List<String> skills, String bio, String avatar) {

        User user = userRepository.save(User.builder()
                .name(name)
                .email(email)
                .passwordHash(passwordEncoder.encode("Tech@123"))
                .phone(phone)
                .district(district)
                .role(Role.TECHNICIAN)
                .serviceCategory(category)
                .avatar(avatar)
                .build());

        technicianRepository.save(TechnicianProfile.builder()
                .user(user)
                .name(name)
                .email(email)
                .phone(phone)
                .category(category)
                .district(district)
                .rating(rating)
                .reviewCount(reviewCount)
                .visitFee(visitFee)
                .experienceYears(experienceYears)
                .verified(verified)
                .available(true)
                .distanceKm(distanceKm)
                .skills(skills)
                .bio(bio)
                .avatar(avatar)
                .build());
    }
}
