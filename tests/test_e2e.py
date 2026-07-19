import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Constants
BASE_URL = "http://your-app-url.com"
SIGNUP_URL = f"{BASE_URL}/signup"
TICKET_URL = f"{BASE_URL}/ticket"
REPLY_URL = f"{BASE_URL}/reply"
STATUS_URL = f"{BASE_URL}/status"

@pytest.fixture
def driver():
    # Initialize the Chrome WebDriver
    driver = webdriver.Chrome()
    yield driver
    # Teardown - close the browser
    driver.quit()

def test_user_signup(driver):
    driver.get(SIGNUP_URL)
    # Fill out the signup form
    driver.find_element(By.ID, "username").send_keys("testuser")
    driver.find_element(By.ID, "email").send_keys("testuser@example.com")
    driver.find_element(By.ID, "password").send_keys("testpassword")
    driver.find_element(By.ID, "confirm_password").send_keys("testpassword")
    driver.find_element(By.ID, "signup_button").click()
    # Wait for the success message
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "signup_success"))
    )
    assert "Signup successful" in driver.page_source

def test_ticket_registration(driver):
    driver.get(TICKET_URL)
    # Fill out the ticket registration form
    driver.find_element(By.ID, "title").send_keys("Test Ticket")
    driver.find_element(By.ID, "description").send_keys("This is a test ticket description.")
    driver.find_element(By.ID, "submit_ticket").click()
    # Wait for the success message
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ticket_success"))
    )
    assert "Ticket registered successfully" in driver.page_source

def test_agent_reply(driver):
    driver.get(REPLY_URL)
    # Fill out the reply form
    driver.find_element(By.ID, "ticket_id").send_keys("12345")
    driver.find_element(By.ID, "reply_text").send_keys("This is a test reply from the agent.")
    driver.find_element(By.ID, "submit_reply").click()
    # Wait for the success message
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "reply_success"))
    )
    assert "Reply submitted successfully" in driver.page_source

def test_admin_status_update(driver):
    driver.get(STATUS_URL)
    # Fill out the status update form
    driver.find_element(By.ID, "ticket_id").send_keys("12345")
    driver.find_element(By.ID, "status").send_keys("Resolved")
    driver.find_element(By.ID, "submit_status").click()
    # Wait for the success message
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "status_success"))
    )
    assert "Status updated successfully" in driver.page_source

if __name__ == "__main__":
    pytest.main()