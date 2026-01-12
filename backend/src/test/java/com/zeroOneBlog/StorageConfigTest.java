package com.zeroOneBlog;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import software.amazon.awssdk.services.s3.S3Client;
import com.zeroOneBlog.config.StorageConfig;

@SpringBootTest(classes = StorageConfig.class)
@EnableAutoConfiguration(exclude = {
    DataSourceAutoConfiguration.class, 
    HibernateJpaAutoConfiguration.class,
    SecurityAutoConfiguration.class
})
@TestPropertySource(properties = {
    "storage.endpoint=http://localhost:9000",
    "storage.access-key=testkey",
    "storage.secret-key=testsecret",
    "storage.region=us-east-1",
    "BACKEND_PORT=8080",
    "DB_HOST=localhost",
    "DB_PORT=5432",
    "DB_NAME=testdb",
    "DB_USER=testuser",
    "DB_PASSWORD=testpass",
    "JWT_SECRET=testsecret",
    "JWT_EXPIRATION=3600"
})
public class StorageConfigTest {

    @Autowired
    private S3Client s3Client; // Our Alarik/S3 client

    @Test
    public void testS3ClientConfiguration() {
        assertThat(s3Client).isNotNull();
        System.out.println("S3 Client Bean exists. Configuration test passed.");
    }
}
