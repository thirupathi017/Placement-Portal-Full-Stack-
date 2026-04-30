package com.placementportal;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheck {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/placement_portal", "root", "170826");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT email, role FROM users WHERE email = 'admin@gmail.com'");
        if (rs.next()) {
            System.out.println("USER_FOUND: " + rs.getString("email") + " ROLE: " + rs.getString("role"));
        } else {
            System.out.println("USER_NOT_FOUND");
        }
        conn.close();
    }
}
