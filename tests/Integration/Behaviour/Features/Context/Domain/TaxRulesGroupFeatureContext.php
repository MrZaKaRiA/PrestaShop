<?php
/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to https://devdocs.prestashop.com/ for more information.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 */

declare(strict_types=1);

namespace Tests\Integration\Behaviour\Features\Context\Domain;

use PrestaShop\PrestaShop\Core\Domain\TaxRulesGroup\Exception\TaxRulesGroupNotFoundException;
use RuntimeException;
use TaxRulesGroup;

class TaxRulesGroupFeatureContext extends AbstractDomainFeatureContext
{
    /**
     * @param string $name
     *
     * @return TaxRulesGroup
     */
    public static function getTaxRulesGroupByName(string $name): TaxRulesGroup
    {
        $taxRulesGroupId = (int) TaxRulesGroup::getIdByName($name);
        $taxRulesGroup = new TaxRulesGroup($taxRulesGroupId);

        if ($taxRulesGroupId !== (int) $taxRulesGroup->id) {
            throw new RuntimeException(sprintf('Tax rules group "%s" not found', $name));
        }

        return $taxRulesGroup;
    }

    /**
     * @Given tax rules group named :name exists
     *
     * @param string $name
     */
    public function assertTaxRuleGroupExists(string $name)
    {
        self::getTaxRulesGroupByName($name);
    }

    /**
     * @Then I should get error that tax rules group does not exist
     */
    public function assertLastErrorIsTaxRulesGroupNotFound(): void
    {
        $this->assertLastErrorIs(TaxRulesGroupNotFoundException::class);
    }
}
