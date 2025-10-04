#!/bin/bash

# Verification script - Run before deployment

echo "🔍 Running pre-deployment checks..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# 1. Check for compiled JS files in src
echo "1️⃣  Checking for unwanted compiled JS files..."
JS_FILES=$(find src tests -name "*.js" 2>/dev/null | wc -l)
if [ "$JS_FILES" -eq 0 ]; then
    echo -e "${GREEN}✅ No compiled JS files found${NC}"
else
    echo -e "${RED}❌ Found $JS_FILES compiled JS files - run: npm run clean${NC}"
    FAILURES=$((FAILURES+1))
fi
echo ""

# 2. TypeScript type checking
echo "2️⃣  Running TypeScript type check..."
if npm run type-check --silent; then
    echo -e "${GREEN}✅ TypeScript type checking passed${NC}"
else
    echo -e "${RED}❌ TypeScript type checking failed${NC}"
    FAILURES=$((FAILURES+1))
fi
echo ""

# 3. Build test
echo "3️⃣  Testing production build..."
if npm run build --silent; then
    echo -e "${GREEN}✅ Production build successful${NC}"
else
    echo -e "${RED}❌ Production build failed${NC}"
    FAILURES=$((FAILURES+1))
fi
echo ""

# 4. Check dist structure
echo "4️⃣  Verifying build output..."
REQUIRED_FILES=("dist/index.html" "dist/styles.css" "dist/assets" "dist/data")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -e "$file" ]; then
        echo -e "${GREEN}✅ Found: $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        FAILURES=$((FAILURES+1))
    fi
done
echo ""

# 5. Check data files
echo "5️⃣  Checking data files..."
DATA_FILES=("dist/data/articles.json" "dist/data/questions-core.json" "dist/data/questions-meta.json" "dist/data/videos.json")
for file in "${DATA_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ Found: $(basename $file)${NC}"
    else
        echo -e "${RED}❌ Missing: $(basename $file)${NC}"
        FAILURES=$((FAILURES+1))
    fi
done
echo ""

# 6. Check package.json dependencies
echo "6️⃣  Verifying React dependencies..."
if grep -q '"react"' package.json && grep -q '"react-dom"' package.json; then
    echo -e "${GREEN}✅ React dependencies found${NC}"
else
    echo -e "${RED}❌ React dependencies missing${NC}"
    FAILURES=$((FAILURES+1))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED! Ready to deploy!${NC}"
    echo ""
    echo "Deploy with:"
    echo "  git add ."
    echo "  git commit -m \"Your message\""
    echo "  git push origin main"
    exit 0
else
    echo -e "${RED}❌ $FAILURES check(s) failed. Please fix before deploying.${NC}"
    exit 1
fi
