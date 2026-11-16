import { expect, test } from '@playwright/test';

test.describe('Terraform import @smoke', () => {
  test('previews the sample, loads it, and traces a relationship in the inspector', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Load a Terraform plan' }).click();
    await page.getByRole('button', { name: /Multi-region sample/ }).click();
    await expect(page.getByLabel('Plan preview')).toContainText('us-east-1');
    await expect(page.getByLabel('Plan preview')).toContainText('us-west-2');
    await page.getByRole('button', { name: 'Load world' }).click();
    await page.getByRole('button', { name: /Enter Modern City/ }).click();

    const inspector = page.getByLabel('Infrastructure');
    await expect(inspector).toContainText('60 resources');
    await inspector.getByText('Region level').first().click();
    await inspector.getByRole('button', { name: 'web-east', exact: true }).first().click();
    await expect(page.getByLabel('Resource details')).toContainText('Security group');
    await page.getByLabel('Resource details').getByRole('button', { name: 'east-vpc' }).click();
    await expect(page.getByLabel('Resource details')).toContainText('VPC');
  });

  test('shows an error for unsupported plans and keeps the dialog usable', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Load a Terraform plan' }).click();
    await page
      .getByLabel('Plan JSON', { exact: true })
      .fill('{"format_version":"2.0","resource_changes":[]}');
    await page.getByRole('button', { name: 'Preview' }).click();
    await expect(page.getByRole('alert')).toContainText('Unsupported plan format_version');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
