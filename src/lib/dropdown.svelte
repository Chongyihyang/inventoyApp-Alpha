<!-- Combobox.svelte -->
<script>
    let {
        options,
        selectedValue = $bindable(),
        label,
        name,
        placeholder,
        required,
        disabled,
        allowCustomInput,
    } = $props()

    import { createEventDispatcher } from 'svelte';
	  import { preventDefault } from 'svelte/legacy';
    const dispatch = createEventDispatcher();
  
    let isOpen = $state(false);
    let inputValue = $state('');
    let filteredOptions = $state(options);
  
    // Filter options based on input
    function filterOptions() {
      if (!inputValue.trim()) {
        filteredOptions = options;
      } else {
        filteredOptions = options.filter(option =>
          option.display.toLowerCase().includes(inputValue.toLowerCase())
        );
      }
    }
  
    function handleInput(event) {
      inputValue = event.target.value;
      filterOptions();
      isOpen = true;
      
      // If allowing custom input, update selected value
      if (allowCustomInput) {
        selectedValue = inputValue;
        dispatch('change', { value: inputValue, display: inputValue, isCustom: true });
      }
    }
  
    function selectOption(option) {
      selectedValue = option.value;
      inputValue = option.display;
      isOpen = false;
      dispatch('change', { value: option.value, display: option.display, isCustom: false });
    }
  
    function handleBlur() {
      setTimeout(() => {
        isOpen = false;
      }, 200);
    }
  
    function handleFocus() {
      filterOptions();
      isOpen = true;
    }
  
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        isOpen = false;
      } else if (event.key === 'Enter' && isOpen && filteredOptions.length > 0) {
        selectOption(filteredOptions[0]);
        event.preventDefault();
      }
    }
  
    // Sync input value when selectedValue changes externally
    $effect(() => {
        if (selectedValue) {
            const selectedOption = options.find(opt => opt.value === selectedValue);
            if (selectedOption) {
            inputValue = selectedOption.display;
            }
        }
    }
    )
  </script>
  
  <div class="combobox-container">
    {#if label}
      <label for="{name}-input" class="combobox-label">
        {label}
        {#if required}<span class="required">*</span>{/if}
      </label>
    {/if}
  
    <div class="combobox-wrapper">
      <input
        id="{name}-input"
        type="text"
        name="{name}"
        bind:value={inputValue}
        oninput={handleInput}
        onfocus={handleFocus}
        onblur={handleBlur}
        onkeydown={handleKeyDown}
        {placeholder}
        {required}
        {disabled}
        class="text"
        class:disabled
        autocomplete="off"
      />
      
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="combobox-arrow" onclick={() => isOpen = !isOpen}>▼</div>
  
      {#if isOpen && filteredOptions.length > 0}
        <div class="combobox-dropdown">
          <ul class="dropdown-list block">
            {#each filteredOptions as option (option.value)}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
              <li
                onclick={() => selectOption(option)}
                onmousedown={preventDefault}
                class="dropdown-item"
                class:selected={option.value === selectedValue}
              >
                {option.display}
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  
    {#if allowCustomInput}
      <input type="hidden" name="{name}" value={selectedValue} />
    {/if}
  </div>
  
  <style>
    /* .combobox-container {
      position: relative;
      margin: 1rem 0;
    }
  
  
    .combobox-wrapper {
      position: relative;
    }
  
  
    .combobox-arrow {
      position: absolute;
      right: 1rem;
      top: 60%;
      transform: translateY(-50%);
      cursor: pointer;
      color: #666;
      pointer-events: none;
    } */
  
    .combobox-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #1e2939;
      border: 2px solid #007acc;
      border-top: none;
      border-radius: 0 0 6px 6px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      width: 90%;
      margin: 0 auto;
    }
  
    .dropdown-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  
    .dropdown-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      border-bottom: 1px solid #1e2939;
      transition: background-color 0.2s ease;
    }
  
    .dropdown-item:hover {
      background-color: #f0f8ff;
      color: #1e2939;
    }
  
    .dropdown-item.selected {
      background-color: #007acc;
      color: white;
    }
  
    .dropdown-item:last-child {
      border-bottom: none;
    }
  </style>