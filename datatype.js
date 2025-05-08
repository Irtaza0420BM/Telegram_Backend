// Dynamic Programming Example: Fibonacci Sequence
// This file demonstrates three approaches to calculate Fibonacci numbers:
// 1. Naive recursive approach (exponential time complexity)
// 2. Top-down DP with memoization (linear time complexity)
// 3. Bottom-up DP with tabulation (linear time complexity)

// 1. Naive recursive approach - O(2^n) time complexity
function fibonacciRecursive(n) {
    // Base cases
    if (n <= 0) return 0;
    if (n === 1) return 1;
    
    // Recursive calculation
    return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
  }
  
  // 2. Top-down DP with memoization - O(n) time complexity
  function fibonacciMemoization(n, memo = {}) {
    // Check if we've already calculated this value
    if (n in memo) return memo[n];
    
    // Base cases
    if (n <= 0) return 0;
    if (n === 1) return 1;
    
    // Calculate and store the result
    memo[n] = fibonacciMemoization(n - 1, memo) + fibonacciMemoization(n - 2, memo);
    return memo[n];
  }
  
  // 3. Bottom-up DP with tabulation - O(n) time complexity
  function fibonacciTabulation(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    
    // Initialize the table with known values
    const dp = new Array(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    
    // Fill the table bottom-up
    for (let i = 2; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
  }
  
  // 4. Bottom-up DP with optimized space - O(n) time and O(1) space
  function fibonacciOptimized(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    
    let prev2 = 0;  // fib(0)
    let prev1 = 1;  // fib(1)
    let current = 0;
    
    for (let i = 2; i <= n; i++) {
      current = prev1 + prev2;
      prev2 = prev1;
      prev1 = current;
    }
    
    return current;
  }
  
  // Performance comparison
  function comparePerformance(n) {
    console.log(`Calculating Fibonacci(${n}):`);
    
    // Only run recursive for small values to avoid stack overflow
    if (n <= 30) {
      console.time('Recursive');
      const recResult = fibonacciRecursive(n);
      console.timeEnd('Recursive');
      console.log(`Recursive result: ${recResult}`);
    } else {
      console.log('Recursive: Skipped (would take too long)');
    }
    
    console.time('Memoization');
    const memoResult = fibonacciMemoization(n);
    console.timeEnd('Memoization');
    console.log(`Memoization result: ${memoResult}`);
    
    console.time('Tabulation');
    const tabResult = fibonacciTabulation(n);
    console.timeEnd('Tabulation');
    console.log(`Tabulation result: ${tabResult}`);
    
    console.time('Optimized');
    const optResult = fibonacciOptimized(n);
    console.timeEnd('Optimized');
    console.log(`Optimized result: ${optResult}`);
  }
  
  // Example usage
  comparePerformance(40);