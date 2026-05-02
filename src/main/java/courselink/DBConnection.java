package courselink;

import java.sql.Connection;
import java.sql.DriverManager;

public class DBConnection {
    private static final String URL = setting("courselink.db.url", "COURSELINK_DB_URL", "jdbc:mysql://localhost:3306/courselink");
    private static final String USER = setting("courselink.db.user", "COURSELINK_DB_USER", "root");
    private static final String PASSWORD = setting("courselink.db.password", "COURSELINK_DB_PASSWORD", "1234");

    public static Connection getConnection() throws Exception {
        Class.forName("com.mysql.cj.jdbc.Driver");
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    private static String setting(String propertyName, String envName, String defaultValue) {
        String propertyValue = System.getProperty(propertyName);
        if (propertyValue != null && !propertyValue.isBlank()) {
            return propertyValue;
        }

        String envValue = System.getenv(envName);
        if (envValue != null && !envValue.isBlank()) {
            return envValue;
        }

        return defaultValue;
    }
}
