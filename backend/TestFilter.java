import java.net.HttpURLConnection;
import java.net.URL;

public class TestFilter {
    public static void main(String[] args) throws Exception {
        URL url = new URL("http://localhost:8080/api/jobs?jobType=FULL_TIME");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        // We need an auth token for /api/jobs...
        // Let's write a quick query test instead.
    }
}
