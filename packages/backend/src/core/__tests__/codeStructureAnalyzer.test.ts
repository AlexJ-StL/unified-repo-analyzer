/**
 * Tests for code structure analyzer
 */

import { analyzeCodeStructure } from '../codeStructureAnalyzer';

describe('Code Structure Analyzer', () => {
  describe('JavaScript/TypeScript detection', () => {
    test('should detect function declarations', () => {
      const code = `
        function hello(name) {
          return \`Hello, \${name}!\`;
        }
        
        const greet = function(name) {
          return \`Greetings, \${name}!\`;
        };
        
        const arrow = (name) => {
          return \`Hi, \${name}!\`;
        };
        
        const obj = {
          sayHello: function(name) {
            return \`Hello from object, \${name}!\`;
          }
        };
      `;

      const result = analyzeCodeStructure(code, 'JavaScript');

      expect(result.functions).toHaveLength(4);
      expect(result.functions.map((f) => f.name)).toContain('hello');
      expect(result.functions.map((f) => f.name)).toContain('greet');
      expect(result.functions.map((f) => f.name)).toContain('arrow');
      expect(result.functions.map((f) => f.name)).toContain('sayHello');
    });

    test('should detect class declarations', () => {
      const code = `
        class Person {
          constructor(name) {
            this.name = name;
          }
          
          greet() {
            return \`Hello, I'm \${this.name}!\`;
          }
        }
        
        export class Employee extends Person {
          constructor(name, title) {
            super(name);
            this.title = title;
          }
        }
      `;

      const result = analyzeCodeStructure(code, 'JavaScript');

      expect(result.classes).toHaveLength(2);
      expect(result.classes.map((c) => c.name)).toContain('Person');
      expect(result.classes.map((c) => c.name)).toContain('Employee');
    });

    test('should count import statements', () => {
      const code = `
        import React from 'react';
        import { useState, useEffect } from 'react';
        import * as utils from './utils';
        import './styles.css';
      `;

      const result = analyzeCodeStructure(code, 'JavaScript');

      expect(result.importCount).toBe(4);
    });
  });

  describe('Python detection', () => {
    test('should detect function declarations', () => {
      const code = `
        def hello(name):
            return f"Hello, {name}!"
        
        def greet(name):
            return f"Greetings, {name}!"
            
        async def async_greet(name):
            return f"Async greetings, {name}!"
      `;

      const result = analyzeCodeStructure(code, 'Python');

      expect(result.functions).toHaveLength(3);
      expect(result.functions.map((f) => f.name)).toContain('hello');
      expect(result.functions.map((f) => f.name)).toContain('greet');
      expect(result.functions.map((f) => f.name)).toContain('async_greet');
    });

    test('should detect class declarations', () => {
      const code = `
        class Person:
            def __init__(self, name):
                self.name = name
                
            def greet(self):
                return f"Hello, I'm {self.name}!"
        
        class Employee(Person):
            def __init__(self, name, title):
                super().__init__(name)
                self.title = title
      `;

      const result = analyzeCodeStructure(code, 'Python');

      expect(result.classes).toHaveLength(2);
      expect(result.classes.map((c) => c.name)).toContain('Person');
      expect(result.classes.map((c) => c.name)).toContain('Employee');
    });

    test('should count import statements', () => {
      const code = `
        import os
        import sys
        from datetime import datetime
        from typing import List, Dict
        import numpy as np
      `;

      const result = analyzeCodeStructure(code, 'Python');

      expect(result.importCount).toBe(4); // Our regex matches 4 import statements
    });
  });

  describe('Java detection', () => {
    test('should detect method declarations', () => {
      const code = `
        public class Example {
            public String hello(String name) {
                return "Hello, " + name + "!";
            }
            
            private void greet(String name) {
                System.out.println("Greetings, " + name + "!");
            }
            
            protected static int calculate(int a, int b) throws Exception {
                return a + b;
            }
        }
      `;

      const result = analyzeCodeStructure(code, 'Java');

      expect(result.functions).toHaveLength(3);
      expect(result.functions.map((f) => f.name)).toContain('hello');
      expect(result.functions.map((f) => f.name)).toContain('greet');
      expect(result.functions.map((f) => f.name)).toContain('calculate');
    });

    test('should detect class declarations', () => {
      const code = `
        package com.example;
        
        public class Person {
            private String name;
            
            public Person(String name) {
                this.name = name;
            }
        }
        
        class Employee extends Person {
            private String title;
            
            public Employee(String name, String title) {
                super(name);
                this.title = title;
            }
        }
      `;

      const result = analyzeCodeStructure(code, 'Java');

      expect(result.classes).toHaveLength(2);
      expect(result.classes.map((c) => c.name)).toContain('Person');
      expect(result.classes.map((c) => c.name)).toContain('Employee');
    });

    test('should count import statements', () => {
      const code = `
        package com.example;
        
        import java.util.List;
        import java.util.Map;
        import java.io.File;
        import com.example.utils.*;
      `;

      const result = analyzeCodeStructure(code, 'Java');

      expect(result.importCount).toBe(4);
    });
  });

  describe('Generic detection', () => {
    test('should detect functions and classes in unknown languages', () => {
      const code = `
        function hello() {
          console.log("Hello");
        }
        
        class Example {
          constructor() {}
        }
        
        import something from 'somewhere';
      `;

      const result = analyzeCodeStructure(code, 'Unknown');

      expect(result.functions).toHaveLength(1);
      expect(result.functions[0].name).toBe('hello');
      expect(result.classes).toHaveLength(1);
      expect(result.classes[0].name).toBe('Example');
      expect(result.importCount).toBe(1);
    });
  });
});
