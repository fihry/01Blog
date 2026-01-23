package com.zeroOneBlog;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import com.zeroOneBlog.config.MinioConfig;

import io.minio.MinioClient;

// Load only the MinioConfig class to test it in isolation (mostly)
// But MinioConfig is just a configuration, we need the context to wire beans
@SpringBootTest(classes = MinioConfig.class)
@EnableAutoConfiguration(exclude = {
    DataSourceAutoConfiguration.class, 
    HibernateJpaAutoConfiguration.class,
    SecurityAutoConfiguration.class
})
@TestPropertySource(properties = {
    "minio.url.internal=http://minio:9000",
    "minio.url.external=http://localhost:9000",
    "minio.access-key=testkey",
    "minio.secret-key=testsecret",
    // These might be needed if other default configizers run, holding placeholders
    "BACKEND_PORT=8080",
    "DB_HOST=localhost",
    "DB_PORT=5432",
    "DB_NAME=testdb",
    "DB_USER=testuser",
    "DB_PASSWORD=testpass",
    "MINIO_PORT=9000",
    "MINIO_ROOT_USER=testkey",
    "MINIO_ROOT_PASSWORD=testsecret",
    "MINIO_BUCKET=testbucket",
    "JWT_SECRET=testsecret",
    "JWT_EXPIRATION=3600"
})
public class MinioConfigTest {

    @Autowired
    @Qualifier("minioSignerClient")
    private MinioClient minioSignerClient;

    @Autowired
    private MinioClient minioClient; // The primary one

    @Test
    public void testMinioClientsConfiguration() {
        assertThat(minioSignerClient).isNotNull();
        assertThat(minioClient).isNotNull();
        assertThat(minioSignerClient).isNotSameAs(minioClient);
        
        System.out.println("Minio Signer Client Bean exists. Configuration test passed.");
    }
}

