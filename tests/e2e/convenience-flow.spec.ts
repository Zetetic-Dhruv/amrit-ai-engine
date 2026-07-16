import { expect, test } from "@playwright/test";
import * as XLSX from "xlsx";

function surveyBuffer(village: string) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{
    "Village Name": village, "Q1.1": "No", "Q2.1": "Yes", "Q3.1": "Yes",
    "Q4.1": "Yes", "Q5.1": "Yes", "Q6.1": "Yes",
  }]), "Village Survey");
  return Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
}

test("catalogue to focused review remains a single clear flow", async ({ page }) => {
  await page.goto("/");
  if (page.url().endsWith("/setup")) {
    const providerCsv = Buffer.from("Provider Name,Description,Track Tags,Contact Name,Contact Email,Contact Phone\nJal Saathi,Safe rural water purification,Drinking Water,Asha,asha@example.test,+91 90000 10001\nSehat Link,Rural telehealth access,Healthcare,Meera,meera@example.test,+91 90000 10002");
    await page.locator('input[type="file"]').setInputFiles({ name: "providers.csv", mimeType: "text/csv", buffer: providerCsv });
    await page.getByRole("button", { name: "Prepare catalogue" }).click();
    await expect(page.getByRole("link", { name: "Continue to surveys" })).toBeVisible({ timeout: 20_000 });
    await page.getByRole("link", { name: "Continue to surveys" }).click();
  }

  await expect(page.getByRole("heading", { name: "From survey to shortlist." })).toBeVisible();
  const village = `Anandpur ${Date.now()}`;
  await page.locator('input[type="file"]').setInputFiles({ name: `${village}.xlsx`, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: surveyBuffer(village) });
  await page.getByRole("button", { name: "Find village needs" }).click();
  await expect(page.getByRole("button", { name: "Start review" })).toBeVisible({ timeout: 25_000 });
  await page.getByRole("button", { name: "Start review" }).click();
  await expect(page.getByRole("button", { name: "Approve" })).toBeVisible();
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("Provider 2 of 2")).toBeVisible();
  await page.getByRole("button", { name: "Reject" }).click();
  await page.getByRole("button", { name: "Wrong track" }).click();
  await expect(page).toHaveURL(/\/complete\//);
  await expect(page.getByRole("heading", { name: "Your shortlist is ready." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download approved matches" })).toBeVisible();
});
