#!/usr/bin/env node

/**
 * マイグレーション実行スクリプト
 * 環境に応じて適切なマイグレーション戦略を実行
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production';
const command = process.argv[2];

// カラーコード
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(cmd, options = {}) {
  try {
    log(`実行中: ${cmd}`, 'blue');
    const result = execSync(cmd, { stdio: 'inherit', ...options });
    return result;
  } catch (error) {
    log(`エラー: ${error.message}`, 'red');
    process.exit(1);
  }
}

// マイグレーション前のバックアップ（本番環境のみ）
function backupDatabase() {
  if (!isProduction) {
    log('開発環境のためバックアップをスキップ', 'yellow');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  log('データベースのバックアップを作成中...', 'yellow');
  
  // PostgreSQLのバックアップ
  const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);
  execCommand(
    `pg_dump ${process.env.DATABASE_URL} > ${backupFile}`,
    { shell: true }
  );
  
  log(`バックアップ完了: ${backupFile}`, 'green');
}

// マイグレーションの実行
function runMigration() {
  log('Prismaスキーマをセットアップ中...', 'yellow');
  execCommand('npm run prisma:setup-env');

  if (isProduction) {
    log('本番環境のマイグレーションを実行中...', 'yellow');
    execCommand('npx prisma migrate deploy');
  } else {
    log('開発環境のマイグレーションを実行中...', 'yellow');
    execCommand('npx prisma migrate dev');
  }

  log('マイグレーション完了！', 'green');
}

// マイグレーションのステータス確認
function checkStatus() {
  log('マイグレーションステータスを確認中...', 'yellow');
  execCommand('npx prisma migrate status');
}

// スキーマの検証
function validateSchema() {
  log('Prismaスキーマを検証中...', 'yellow');
  execCommand('npx prisma validate');
  
  if (isProduction) {
    // PostgreSQL特有の検証
    log('PostgreSQLスキーマの互換性を確認中...', 'yellow');
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.postgresql.prisma');
    
    if (!fs.existsSync(schemaPath)) {
      log('PostgreSQLスキーマファイルが見つかりません！', 'red');
      process.exit(1);
    }
  }
  
  log('スキーマ検証完了！', 'green');
}

// メイン処理
async function main() {
  log(`環境: ${isProduction ? '本番' : '開発'}`, 'blue');
  
  switch (command) {
    case 'up':
      validateSchema();
      backupDatabase();
      runMigration();
      break;
      
    case 'status':
      checkStatus();
      break;
      
    case 'validate':
      validateSchema();
      break;
      
    case 'backup':
      backupDatabase();
      break;
      
    default:
      log('使用方法:', 'yellow');
      log('  node scripts/migrate.js up       - マイグレーションを実行');
      log('  node scripts/migrate.js status   - ステータスを確認');
      log('  node scripts/migrate.js validate - スキーマを検証');
      log('  node scripts/migrate.js backup   - バックアップを作成（本番のみ）');
      process.exit(1);
  }
}

main().catch((error) => {
  log(`予期しないエラー: ${error.message}`, 'red');
  process.exit(1);
});