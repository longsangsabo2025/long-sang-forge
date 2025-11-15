#!/usr/bin/env node
/**
 * 🌐 Multi-Site SEO Manager
 * Quản lý SEO cho nhiều websites từ một nơi
 */

import { getDomains, createDomain, updateDomain, getQueueStats } from '../src/lib/seo-api.ts';
import chalk from 'chalk';
import inquirer from 'inquirer';

console.log(chalk.blue.bold('\n🌐 MULTI-SITE SEO MANAGER\n'));

const ACTIONS = {
  LIST: 'Xem tất cả websites',
  ADD: 'Thêm website mới',
  STATS: 'Xem thống kê',
  ENABLE: 'Bật/tắt website',
  EXIT: 'Thoát',
};

async function main() {
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Bạn muốn làm gì?',
        choices: Object.values(ACTIONS),
      },
    ]);

    switch (action) {
      case ACTIONS.LIST:
        await listWebsites();
        break;
      case ACTIONS.ADD:
        await addWebsite();
        break;
      case ACTIONS.STATS:
        await showStats();
        break;
      case ACTIONS.ENABLE:
        await toggleWebsite();
        break;
      case ACTIONS.EXIT:
        console.log(chalk.green('\n👋 Tạm biệt!\n'));
        process.exit(0);
    }
  }
}

async function listWebsites() {
  console.log(chalk.yellow('\n📋 Danh sách websites:\n'));
  
  try {
    const domains = await getDomains();
    
    if (domains.length === 0) {
      console.log(chalk.gray('  Chưa có website nào. Hãy thêm website mới!\n'));
      return;
    }
    
    for (const domain of domains) {
      const status = domain.enabled ? chalk.green('✅ Active') : chalk.red('⏸ Paused');
      const progress = domain.total_urls > 0 
        ? `${Math.round((domain.indexed_urls / domain.total_urls) * 100)}%`
        : 'N/A';
      
      console.log(chalk.white(`\n  ${domain.name}`));
      console.log(chalk.gray(`  URL: ${domain.url}`));
      console.log(chalk.gray(`  Status: ${status}`));
      console.log(chalk.gray(`  URLs: ${domain.indexed_urls}/${domain.total_urls} (${progress} indexed)`));
      console.log(chalk.gray(`  Auto-index: ${domain.auto_index ? 'Yes' : 'No'}`));
    }
    
    console.log('\n');
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
  }
}

async function addWebsite() {
  console.log(chalk.yellow('\n➕ Thêm website mới:\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Tên website:',
      validate: (input) => input.length > 0 || 'Tên không được để trống',
    },
    {
      type: 'input',
      name: 'url',
      message: 'URL (bao gồm https://):',
      validate: (input) => {
        try {
          new URL(input);
          return true;
        } catch {
          return 'URL không hợp lệ';
        }
      },
    },
    {
      type: 'confirm',
      name: 'autoIndex',
      message: 'Bật tự động indexing?',
      default: true,
    },
  ]);
  
  try {
    const domain = await createDomain({
      name: answers.name,
      url: answers.url,
      auto_index: answers.autoIndex,
    });
    
    console.log(chalk.green(`\n✅ Đã thêm website: ${domain.name}`));
    console.log(chalk.gray(`   ID: ${domain.id}`));
    console.log(chalk.gray(`   URL: ${domain.url}\n`));
    
    console.log(chalk.yellow('📝 Next steps:'));
    console.log(chalk.gray('1. Verify website trong Google Search Console'));
    console.log(chalk.gray('2. Add service account: automation-bot-102@long-sang-automation.iam.gserviceaccount.com'));
    console.log(chalk.gray('3. Generate sitemap cho website'));
    console.log(chalk.gray('4. Chạy automation để index URLs\n'));
    
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
  }
}

async function showStats() {
  console.log(chalk.yellow('\n📊 Thống kê tổng quan:\n'));
  
  try {
    const domains = await getDomains();
    
    if (domains.length === 0) {
      console.log(chalk.gray('  Chưa có dữ liệu.\n'));
      return;
    }
    
    const totalDomains = domains.length;
    const activeDomains = domains.filter(d => d.enabled).length;
    const totalUrls = domains.reduce((sum, d) => sum + d.total_urls, 0);
    const indexedUrls = domains.reduce((sum, d) => sum + d.indexed_urls, 0);
    const overallProgress = totalUrls > 0 ? Math.round((indexedUrls / totalUrls) * 100) : 0;
    
    console.log(chalk.white('  Tổng quan:'));
    console.log(chalk.gray(`  • Tổng số websites: ${totalDomains}`));
    console.log(chalk.gray(`  • Websites đang active: ${activeDomains}`));
    console.log(chalk.gray(`  • Tổng URLs: ${totalUrls.toLocaleString()}`));
    console.log(chalk.gray(`  • URLs đã index: ${indexedUrls.toLocaleString()}`));
    console.log(chalk.gray(`  • Progress: ${overallProgress}%`));
    
    console.log(chalk.white('\n  Top websites:'));
    const topDomains = domains
      .sort((a, b) => b.total_urls - a.total_urls)
      .slice(0, 5);
    
    for (const domain of topDomains) {
      const progress = domain.total_urls > 0 
        ? `${Math.round((domain.indexed_urls / domain.total_urls) * 100)}%`
        : 'N/A';
      console.log(chalk.gray(`  • ${domain.name}: ${domain.total_urls} URLs (${progress} indexed)`));
    }
    
    // Queue stats
    console.log(chalk.white('\n  Indexing Queue:'));
    for (const domain of domains.filter(d => d.enabled)) {
      try {
        const stats = await getQueueStats(domain.id);
        if (stats.total > 0) {
          console.log(chalk.gray(`  • ${domain.name}:`));
          console.log(chalk.gray(`    - Pending: ${stats.pending}`));
          console.log(chalk.gray(`    - Indexed: ${stats.indexed}`));
          console.log(chalk.gray(`    - Failed: ${stats.failed}`));
        }
      } catch (error) {
        // Skip if no queue data
      }
    }
    
    console.log('\n');
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
  }
}

async function toggleWebsite() {
  console.log(chalk.yellow('\n🔄 Bật/tắt website:\n'));
  
  try {
    const domains = await getDomains();
    
    if (domains.length === 0) {
      console.log(chalk.gray('  Chưa có website nào.\n'));
      return;
    }
    
    const { domainId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'domainId',
        message: 'Chọn website:',
        choices: domains.map(d => ({
          name: `${d.name} (${d.enabled ? '✅ Active' : '⏸ Paused'})`,
          value: d.id,
        })),
      },
    ]);
    
    const domain = domains.find(d => d.id === domainId);
    const newStatus = !domain.enabled;
    
    await updateDomain(domainId, { enabled: newStatus });
    
    console.log(chalk.green(`\n✅ Đã ${newStatus ? 'bật' : 'tắt'} website: ${domain.name}\n`));
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
  }
}

// Run
main().catch((error) => {
  console.error(chalk.red(`\n❌ Fatal error: ${error.message}\n`));
  process.exit(1);
});
