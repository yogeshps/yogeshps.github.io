import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

def main():
    # Read test cases from CSV into a DataFrame
    df = pd.read_csv('test_cases.csv')  # columns: Age,PR_Status,MonthlySalary,AnnualBonus
    
    # Set up Selenium (example with Chrome)
    options = webdriver.ChromeOptions()
    options.add_argument('--start-maximized')
    driver = webdriver.Chrome(options=options)
    
    # Go to your calculator page
    driver.get('http://localhost:5173/')  
    
    # We'll store results in new columns
    results = {
        'EmployeeMonthlyCPF': [],
        'EmployeeBonusCPF': [],
        'EmployerMonthlyCPF': [],
        'EmployerBonusCPF': [],
        'AnnualTax': [],
        'TotalCPF': []
    }
    
    # Prepare to collect all inputs at once
    inputs = []
    
    for index, row in df.iterrows():
        if row.isnull().any():
            continue  # Skip this iteration if there are empty values
        
        inputs.append({
            'age': row['Age'],
            'pr_status': row['PR_Status'],
            'salary': row['Salary'],
            'bonus': row['Bonus']
        })
    
    # Initialize last_spr_status and last_age variables
    last_spr_status = None
    last_age = None  # Track the last age entered

    # Fill in the form fields in one go
    for input_data in inputs:
        # Check if the age has changed
        current_age = int(input_data['age']) if input_data['age'] else 30  # Default to 30 if age is not provided
        if current_age != last_age:
            age_field = driver.find_element(By.NAME, 'age')
            age_field.clear()  # Clear the age field
            age_field.send_keys(Keys.BACKSPACE * 3)  # Send 3 backspaces
            age_field.send_keys(str(current_age))  # Enter the new age
            last_age = current_age  # Update last_age

        # Check if the sprStatus has changed
        current_spr_status = input_data['pr_status']
        if current_spr_status != last_spr_status:
            # Wait for the sprStatus dropdown to be present
            spr_select = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, 'MuiSelect-select'))
            )

            # Click to open the dropdown
            spr_select.click()

            # Wait for the options to be visible
            options = WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.CLASS_NAME, 'MuiList-root'))
            )

            # Select the desired option based on the value from the input_data
            option_value = current_spr_status
            option_text_map = {
                'table1': 'Citizen / SPR 3rd+ (Table1)',
                'table2': 'SPR 1st year (G/G) (Table2)',
                'table3': 'SPR 2nd year (G/G) (Table3)',
                'table4': 'SPR 1st year (F/G) (Table4)',
                'table5': 'SPR 2nd year (F/G) (Table5)',
            }

            # Find the corresponding option text
            option_text = option_text_map.get(option_value)

            # Select the desired option
            if option_text:
                option = driver.find_element(By.XPATH, f'//li[contains(text(), "{option_text}")]')
                option.click()
            else:
                print(f"Invalid SPR Status: {option_value}")

            # Update last_spr_status
            last_spr_status = current_spr_status
        
        # Clear and fill the salary and bonus fields
        monthly_salary_field = driver.find_element(By.NAME, 'monthlySalary')
        monthly_salary_field.clear()  # Clear before re-entry
        monthly_salary_field.send_keys(Keys.BACKSPACE * 6)  # Send 6 backspaces
        monthly_salary_field.send_keys(str(int(input_data['salary'])))  # Enter new salary
        
        bonus_field = driver.find_element(By.NAME, 'annualBonus')
        bonus_field.clear()  # Clear before re-entry
        bonus_field.send_keys(Keys.BACKSPACE * 6)  # Send 6 backspaces
        bonus_field.send_keys(str(int(input_data['bonus'])))  # Enter new bonus
        
        # Wait for results to appear using presence instead of visibility
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, 'MuiTypography-root')))
        
        # Get the initial value for Employee Monthly CPF
        empMonthlyCPF_el = driver.find_element(By.XPATH, "(//p[contains(text(), 'Monthly Salary CPF:')])[1]")
        initial_value = empMonthlyCPF_el.text
        
        # Wait for 200 ms to check if the value changes
        time.sleep(0.05)
        empMonthlyCPF_el = driver.find_element(By.XPATH, "(//p[contains(text(), 'Monthly Salary CPF:')])[1]")
        new_value = empMonthlyCPF_el.text
        
        # Extract numerical value and format to 2 decimal points
        new_value_num = round(float(new_value.split('$')[1].replace(',', '').strip()), 2) if '$' in new_value else 0.0
        results['EmployeeMonthlyCPF'].append(new_value_num)
        
        # Get the initial value for Employer Monthly CPF
        erMonthlyCPF_el = driver.find_element(By.XPATH, "(//p[contains(text(), 'Monthly Salary CPF:')])[2]")
        initial_er_value = erMonthlyCPF_el.text
        
        time.sleep(0.2)
        erMonthlyCPF_el = driver.find_element(By.XPATH, "(//p[contains(text(), 'Monthly Salary CPF:')])[2]")
        new_er_value = erMonthlyCPF_el.text
        
        # Extract numerical value and format to 2 decimal points
        new_er_value_num = round(float(new_er_value.split('$')[1].replace(',', '').strip()), 2) if '$' in new_er_value else 0.0
        results['EmployerMonthlyCPF'].append(new_er_value_num)
        
        # Get the initial value for Annual Tax
        annual_tax_value_el = driver.find_element(By.XPATH, "//h6[contains(text(), 'Annual Tax')]/following-sibling::p")
        initial_tax_value = annual_tax_value_el.text
        
        time.sleep(0.2)
        annual_tax_value_el = driver.find_element(By.XPATH, "//h6[contains(text(), 'Annual Tax')]/following-sibling::p")
        new_tax_value = annual_tax_value_el.text
        
        # Extract numerical value and format to 2 decimal points
        new_tax_value_num = round(float(new_tax_value.split('$')[1].replace(',', '').strip()), 2) if '$' in new_tax_value else 0.0
        results['AnnualTax'].append(new_tax_value_num)
        
        # Get the initial value for Total CPF Contributions
        total_cpf_value_el = driver.find_element(By.XPATH, "//h6[contains(text(), 'Total CPF Contributions')]/following-sibling::p")
        initial_total_cpf_value = total_cpf_value_el.text
        
        time.sleep(0.2)
        total_cpf_value_el = driver.find_element(By.XPATH, "//h6[contains(text(), 'Total CPF Contributions')]/following-sibling::p")
        new_total_cpf_value = total_cpf_value_el.text
        
        # Extract numerical value and format to 2 decimal points
        new_total_cpf_value_num = round(float(new_total_cpf_value.split('$')[1].replace(',', '').strip()), 2) if '$' in new_total_cpf_value else 0.0
        results['TotalCPF'].append(new_total_cpf_value_num)
        
        # Get the initial value for Employee Bonus CPF (1st occurrence)
        empBonusCPF_el = driver.find_element(By.XPATH, "(//p[contains(text(), 'Bonus CPF:')])[1]")
        initial_bonus_value = empBonusCPF_el.text
        
        time.sleep(0.2)
        empBonusCPF_el = driver.find_element(By.XPATH, "(//p[contains(text(), 'Bonus CPF:')])[1]")
        new_bonus_value = empBonusCPF_el.text
        
        # Extract numerical value and format to 2 decimal points
        new_bonus_value_num = round(float(new_bonus_value.split('$')[1].replace(',', '').strip()), 2) if '$' in new_bonus_value else 0.0
        results['EmployeeBonusCPF'].append(new_bonus_value_num)
        
        # Get the initial value for Employer Bonus CPF (2nd occurrence)
        erBonusCPF_el = driver.find_element(By.XPATH, "(//p[contains(text(), 'Bonus CPF:')])[2]")
        initial_er_bonus_value = erBonusCPF_el.text
        
        time.sleep(0.2)
        erBonusCPF_el = driver.find_element(By.XPATH, "(//p[contains(text(), 'Bonus CPF:')])[2]")
        new_er_bonus_value = erBonusCPF_el.text
        
        # Extract numerical value and format to 2 decimal points
        new_er_bonus_value_num = round(float(new_er_bonus_value.split('$')[1].replace(',', '').strip()), 2) if '$' in new_er_bonus_value else 0.0
        results['EmployerBonusCPF'].append(new_er_bonus_value_num)
    
    # Close browser
    driver.quit()
    
    # Put results back into df
    for key in results:
        # Format the numerical values to 2 decimal points
        df[key] = [f"{value:.2f}" for value in results[key]]
    
    # Write out to new CSV
    df.to_csv('test_output.csv', index=False)
    print("Test results saved to test_output.csv")

if __name__ == '__main__':
    main()
